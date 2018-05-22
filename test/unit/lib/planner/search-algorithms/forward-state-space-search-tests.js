'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-algorithms/forward-state-space-search.js', function() {
    describe('_findGoalActions', function() {
        let uuidv4;
        let next;
        let planningProblem;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            uuidv4 = sinon.stub();
            next = sinon.stub();
            planningProblem = {
                fringe: new Map(),
                goalActions: new Set(),
                discoveredActions: new Set(),
                callback: sinon.stub(),
                foundGoalActions: new Set(),
            };
            sinon.spy(planningProblem.fringe, 'delete');
            global.SimulatoError = {
                PLANNER: {
                    GOAL_NOT_FOUND: sinon.stub(),
                },
            };

            mockery.registerMock('uuid/v4', uuidv4);
            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );
        });

        afterEach(function() {
            planningProblem.fringe.delete.restore();
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if the fringe is empty', function() {
            it('should throw an error', function() {
                let error = new Error('My Error');
                let thrownError;
                global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                generator.next();
                try {
                    generator.next();
                } catch (err) {
                    thrownError = err;
                }

                expect(thrownError).to.deep.equal(error);
            });

            it('should call global.SimulatoError.PLANNER.GOAL_NOT_FOUND once with the goals not found', function() {
                planningProblem.goalActions.add('componentInstance.MY_ACTION');
                planningProblem.goalActions.add('componentInstance2.MY_OTHER_ACTION');
                let error = new Error('My Error');
                global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                generator.next();
                try {
                    generator.next();
                } catch (err) {}

                expect(global.SimulatoError.PLANNER.GOAL_NOT_FOUND.args).to.deep.equal([
                    [
                        'Planning finished before finding the following goal(s): ' +
                            'componentInstance.MY_ACTION,componentInstance2.MY_OTHER_ACTION',
                    ],
                ]);
            });
        });

        describe('for an entry in the fringe', function() {
            it('should call fringe.delete once with the key of the first item in the fringe', function() {
                planningProblem.fringe.set('df9df09898-8314dssa', {
                    actions: new Set([
                        'myComponent.MY_ACTION',
                    ]),
                });
                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                generator.next();
                generator.next(next);

                expect(planningProblem.fringe.delete.args).to.deep.equal([
                    [
                        'df9df09898-8314dssa',
                    ],
                ]);
            });

            describe('for an action in node.actions.values', function() {
                it('should forwardStateSpaceSearch.emit 4 times', function() {
                    planningProblem.fringe.set('df9df09898-8314dssa', {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    });
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next({path: []});
                    generator.next();
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.callCount).to.equal(4);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'cloneSearchNode\' the node, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next({path: []});

                    expect(forwardStateSpaceSearch.emit.args[0]).to.deep.equal([
                        'forwardStateSpaceSearch.cloneSearchNode',
                        node,
                        next,
                    ]);
                });

                it('should set clonedNode.actions to an empty set', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);
                    generator.next();

                    expect(clonedNode.actions).to.deep.equal(new Set());
                });

                it('should call clonedNode.path.add once with the action', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let clonedNode = {
                        path: {
                            push: sinon.stub(),
                        },
                    };
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);
                    generator.next();

                    expect(clonedNode.path.push.args).to.deep.equal([
                        [
                            'myComponent.MY_ACTION',
                        ],
                    ]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'applyActionToNode\', clonedNode, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);

                    expect(forwardStateSpaceSearch.emit.args[1]).to.deep.equal([
                        'forwardStateSpaceSearch.applyActionToNode',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'addApplicableActions\', planningProblem, clonedNode, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.args[2]).to.deep.equal([
                        'forwardStateSpaceSearch.addApplicableActions',
                        {
                            fringe: new Map(),
                            goalActions: new Set(),
                            callback: planningProblem.callback,
                            discoveredActions: new Set(),
                            foundGoalActions: new Set(),
                        },
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call fringe.set once with the result of the call to uuidv4 and the clonedNode', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    planningProblem.fringe.set = sinon.stub();
                    let clonedNode = {path: []};
                    uuidv4.returns('my-uuid-v4');
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);
                    generator.next();
                    generator.next();

                    expect(planningProblem.fringe.set.args).to.deep.equal([
                        [
                            'my-uuid-v4',
                            {
                                actions: new Set(),
                                path: ['myComponent.MY_ACTION'],
                            },
                        ],
                    ]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'addApplicableActions\', planningProblem, clonedNode, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    planningProblem.fringe.set('df9df09898-8314dssa', node);
                    let clonedNode = {path: []};
                    uuidv4.returns('my-uuid-v4');
                    let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                    generator.next();
                    generator.next(next);
                    generator.next(clonedNode);
                    generator.next();
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.args[3]).to.deep.equal([
                        'forwardStateSpaceSearch.testForGoal',
                        {
                            fringe: new Map([['my-uuid-v4', {
                                actions: new Set(),
                                path: ['myComponent.MY_ACTION'],
                            }]]),
                            discoveredActions: new Set(),
                            goalActions: new Set(),
                            callback: planningProblem.callback,
                            foundGoalActions: new Set(),
                        },
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                describe('if exploreAllActions is set to true', function() {
                    describe('if discoveredActions.size is equal to foundGoalActions.size', function() {
                        it('should call the planningProblem callback once with null, null, and true as the' +
                            'first 3 parameters', function() {
                            let node = {
                                actions: new Set([
                                    'myComponent.MY_ACTION',
                                ]),
                            };
                            planningProblem.fringe.set('df9df09898-8314dssa', node);
                            planningProblem.exploreAllActions = true;
                            let clonedNode = {path: []};
                            let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                            generator.next();
                            generator.next(next);
                            generator.next(clonedNode);
                            generator.next();
                            generator.next();
                            generator.next();

                            expect(planningProblem.callback.args[0].slice(0, 3)).to.deep.equal([
                                null,
                                null,
                                true,
                            ]);
                        });

                        it('should call the planningProblem callback with the planning problem as the last' +
                            'parameter', function() {
                            let node = {
                                actions: new Set([
                                    'myComponent.MY_ACTION',
                                ]),
                            };
                            planningProblem.fringe.set('df9df09898-8314dssa', node);
                            planningProblem.exploreAllActions = true;
                            planningProblem.discoveredActions.add('myComponent.MY_ACTION');
                            planningProblem.foundGoalActions.add('myComponent.MY_ACTION');
                            let clonedNode = {path: []};
                            let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                            generator.next();
                            generator.next(next);
                            generator.next(clonedNode);
                            generator.next();
                            generator.next();
                            generator.next();

                            expect(planningProblem.callback.args[0][3]).to.deep.equal(
                                planningProblem.discoveredActions
                            );
                        });
                    });

                    describe('if discoveredActions.size is not equal to foundGoalActions.size', function() {
                        describe('if the fringe map is empty', function() {
                            it('should throw an error', function() {
                                let error = new Error('My Error');
                                let thrownError;
                                global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
                                let node = {
                                    actions: new Set([
                                        'myComponent.MY_ACTION',
                                    ]),
                                };
                                planningProblem.fringe.set('df9df09898-8314dssa', node);
                                planningProblem.discoveredActions.add('myComponent.SOME_ACTION');
                                let clonedNode = {path: []};
                                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                                try {
                                    generator.next();
                                    generator.next(next);
                                    generator.next(clonedNode);
                                    generator.next();
                                    generator.next();
                                    generator.next();
                                } catch (err) {
                                    thrownError = err;
                                }

                                expect(thrownError).to.deep.equal(error);
                            });
                        });

                        describe('if the fringe map has another item in it', function() {
                            it('should call fringe.delete with the key of the second item', function() {
                                let node = {
                                    actions: new Set([
                                        'myComponent.MY_ACTION',
                                    ]),
                                };
                                let node2 = {
                                    actions: new Set([
                                        'myComponent.MY_OTHER_ACTION',
                                    ]),
                                };
                                planningProblem.fringe.set('df9df09898-8314dssa', node);
                                planningProblem.fringe.set('5481340813-glkj3813', node2);
                                planningProblem.discoveredActions.add('myComponent.SOME_ACTION');
                                let clonedNode = {path: []};
                                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                                generator.next();
                                generator.next(next);
                                generator.next(clonedNode);
                                generator.next();
                                generator.next();
                                generator.next();

                                expect(planningProblem.fringe.delete.args[1]).to.deep.equal([
                                    '5481340813-glkj3813',
                                ]);
                            });

                            it('should call fringe.delete twice', function() {
                                let node = {
                                    actions: new Set([
                                        'myComponent.MY_ACTION',
                                    ]),
                                };
                                let node2 = {
                                    actions: new Set([
                                        'myComponent.MY_OTHER_ACTION',
                                    ]),
                                };
                                planningProblem.fringe.set('df9df09898-8314dssa', node);
                                planningProblem.fringe.set('5481340813-glkj3813', node2);
                                planningProblem.discoveredActions.add('myComponent.SOME_ACTION');
                                let clonedNode = {path: []};
                                let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                                generator.next();
                                generator.next(next);
                                generator.next(clonedNode);
                                generator.next();
                                generator.next();
                                generator.next();

                                expect(planningProblem.fringe.delete.callCount).to.deep.equal(2);
                            });
                        });
                    });
                });

                describe('if exploreAllActions is set to false', function() {
                    describe('if the foundGoalActions.size is equal to 1', function() {
                        it('should call the planningProblem callback once with null, null, true' +
                            'and planningProblem.disoveredActions ', function() {
                            let node = {
                                actions: new Set([
                                    'myComponent.MY_ACTION',
                                ]),
                            };
                            planningProblem.fringe.set('df9df09898-8314dssa', node);
                            planningProblem.exploreAllActions = false;
                            planningProblem.foundGoalActions.add('some action');
                            planningProblem.discoveredActions.add('some action');
                            let clonedNode = {path: []};
                            let generator = forwardStateSpaceSearch._findGoalActions(planningProblem);

                            generator.next();
                            generator.next(next);
                            generator.next(clonedNode);
                            generator.next();
                            generator.next();
                            generator.next();

                            expect(planningProblem.callback.args[0]).to.deep.equal([
                                null,
                                null,
                                true,
                                planningProblem.discoveredActions,
                            ]);
                        });
                    });
                });
            });
        });
    });

    describe('_checkPreconditions', function() {
        let next;
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;
        let component;
        let node;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            callback = sinon.stub();
            component = {
                name: 'myInstance',
                actions: {
                    MY_ACTION: {
                        preconditions: sinon.stub(),
                    },
                },
            };
            node = {
                state: {
                    getState: sinon.stub().returns({property: 'myProperty'}),
                },
                dataStore: {
                    retrieveAll: sinon.stub().returns({data: 'myData'}),
                },
            };

            mockery.registerMock('uuid/v4', {});
            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if action.preconditions is undefined', function() {
            it('should call the passed in callback once with null, and true as parameters', function() {
                delete component.actions.MY_ACTION.preconditions;

                let generator = forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                generator.next();
                generator.next(next);

                expect(callback.args).to.deep.equal([
                    [
                        null,
                        true,
                    ],
                ]);
            });
        });

        describe('if action.preconditions is defined', function() {
            describe('if actions.parameters is an array', function() {
                describe('if there are two parmeters in the action.parametersArray', function() {
                    it('should call the generate method for the first parameter with the dataStore', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub(),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub(),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.parameters[0].generate.args).to.deep.equal([[
                            node.dataStore,
                        ]]);
                    });

                    it('should call the generate method for the first parameter with the this context ' +
                        'of the component', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub(),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub(),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.parameters[0].generate.thisValues).to.deep.equal([
                            component,
                        ]);
                    });

                    it('should call the generate method for the second parameter with the dataStore', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub(),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub(),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.parameters[1].generate.args).to.deep.equal([[
                            node.dataStore,
                        ]]);
                    });

                    it('should call the generate method for the second parameter with the this context ' +
                        'of the component', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub(),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub(),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.parameters[1].generate.thisValues).to.deep.equal([
                            component,
                        ]);
                    });

                    it('should call action.preconditions once with the generated parameters and ' +
                        'node.dataStore', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub().returns('myFirstParameter'),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub().returns('mySecondParameter'),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.preconditions.args).to.deep.equal([[
                            'myFirstParameter',
                            'mySecondParameter',
                            node.dataStore,
                        ]]);
                    });

                    it('should call action.preconditions with the this context of the component', function() {
                        component.actions.MY_ACTION.parameters = [
                            {
                                name: 'parameterOne',
                                generate: sinon.stub().returns('myFirstParameter'),
                            },
                            {
                                name: 'parameterTwo',
                                generate: sinon.stub().returns('mySecondParameter'),
                            },
                        ];

                        let generator =
                            forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);

                        expect(component.actions.MY_ACTION.preconditions.thisValues).to.deep.equal([
                            component,
                        ]);
                    });
                });
            });

            describe('if actions.Parameters is not an array', function() {
                it('should call action.preconditions once with the node.dataStore', function() {
                    let generator = forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                    generator.next();
                    generator.next(next);

                    expect(component.actions.MY_ACTION.preconditions.args).to.deep.equal([[
                        node.dataStore,
                    ]]);
                });

                it('should call action.preconditions with the this context of the component', function() {
                    let generator = forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                    generator.next();
                    generator.next(next);

                    expect(component.actions.MY_ACTION.preconditions.thisValues).to.deep.equal([
                        component,
                    ]);
                });
            });

            describe('if actions.preconditions throws', function() {
                it('should throw an error with a precondition failure message', function() {
                    let err = new Error('An error occurred');
                    let thrownError;
                    component.actions.MY_ACTION.preconditions.throws(err);
                    let generator = forwardStateSpaceSearch
                        ._checkPreconditions(node, component, 'MY_ACTION', callback);
                    generator.next();
                    try {
                        generator.next(next);
                    } catch (error) {
                        thrownError = error;
                    }

                    expect(thrownError.message).to.equal(
                        'An error with the message \'An error occurred\' was thrown while ' +
                        'executing preconditions for the action \'myInstance.MY_ACTION\''
                    );
                });
            });

            describe('if actions.preconditions is not thrown', function() {
                it('should call fowardStateSpaceSearch.emit once with the event \'forwardStateSpaceSearch.' +
                    'runAssertions\', the result of the call to node.state.getState(), ' +
                    'the preconditions, and the next callback', function() {
                    component.actions.MY_ACTION.preconditions.returns([
                        ['isTrue', 'component.displayed'],
                        ['isFalse', 'component.checkbox.checked'],
                    ]);

                    let generator = forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                    generator.next();
                    generator.next(next);

                    expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                        [
                            'forwardStateSpaceSearch.runAssertions',
                            {property: 'myProperty'},
                            {data: 'myData'},
                            [
                                ['isTrue', 'component.displayed'],
                                ['isFalse', 'component.checkbox.checked'],
                            ],
                            next,
                        ],
                    ]);
                });

                it('should call node.state.getState once with no parameters', function() {
                    component.actions.MY_ACTION.preconditions.returns([
                        ['isTrue', 'component.displayed'],
                        ['isFalse', 'component.checkbox.checked'],
                    ]);

                    let generator = forwardStateSpaceSearch._checkPreconditions(node, component, 'MY_ACTION', callback);
                    generator.next();
                    generator.next(next);

                    expect(node.state.getState.args).to.deep.equal([[]]);
                });

                describe('if forwardStateSpaceSearch.emit throws', function() {
                    it('should call the callback once with null, and false', function() {
                        component.actions.MY_ACTION.preconditions.returns([
                            ['isTrue', 'component.displayed'],
                            ['isFalse', 'component.checkbox.checked'],
                        ]);

                        let generator = forwardStateSpaceSearch
                            ._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);
                        generator.throw(new Error('An error occurred'));

                        expect(callback.args).to.deep.equal([
                            [
                                null,
                                false,
                            ],
                        ]);
                    });
                });

                describe('if forwardStateSpaceSearch.emit does not throw', function() {
                    it('should call the callback once with null, and true', function() {
                        component.actions.MY_ACTION.preconditions.returns([
                            ['isTrue', 'component.displayed'],
                            ['isFalse', 'component.checkbox.checked'],
                        ]);

                        let generator = forwardStateSpaceSearch
                            ._checkPreconditions(node, component, 'MY_ACTION', callback);
                        generator.next();
                        generator.next(next);
                        generator.next();

                        expect(callback.args).to.deep.equal([
                            [
                                null,
                                true,
                            ],
                        ]);
                    });
                });
            });
        });
    });
    describe('_applyActionToNode', function() {
        let uuidv4;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;
        let node;
        let callback;
        let sampleSet;
        let sampleMap;
        let stateObj;
        let action;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );

            uuidv4 = sinon.stub();
            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('uuid/v4', uuidv4);
            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );
            sampleSet = ['test.ACTION'];

            sampleMap = new Map();
            sampleMap.set('test', {
                actions: {ACTION: {
                    perform: sinon.stub(),
                    effects: sinon.stub(),
                    parameters: [{
                        generate: sinon.stub().returns('parameter'),
                    }],
                }}});

            stateObj = {
                getComponentsAsMap: sinon.stub().returns(sampleMap),
            };

            node = {
                path: sampleSet,
                state: stateObj,
                testCase: {
                    push: sinon.stub(),
                },
            };
            callback = sinon.stub();
            action = node.state.getComponentsAsMap().get('test').actions.ACTION;
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should call the callback once', function() {
            forwardStateSpaceSearch._applyActionToNode(node, callback);

            expect(callback.callCount).to.equal(1);
        });
        it('should call node.testCase.push once', function() {
            let testObject =
            {'name': 'test.ACTION',
             'options':
                        {'parameters':
                            ['parameter'],
                        },
            };

            forwardStateSpaceSearch._applyActionToNode(node, callback);

            expect(node.testCase.push.args).to.deep.equal([[testObject]]);
        });
        it('should assign last action to the node', function() {
            forwardStateSpaceSearch._applyActionToNode(node, callback);

            expect(node.lastAction).to.equal('test.ACTION');
        });
        describe('if the parameters are an array', function() {
            it('should call the generate function and produce "parameter"', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0][0]).to.deep.equal('parameter');
            });
            it('should call action effects with the testCaseAction option parameters and the node state', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0]).to.deep.equal(['parameter', stateObj]);
            });
            it('should throw an error if the parameters and action effects throws an error', function() {
                let thrown = new Error('ERROR_THROWN');
                let err;
                action.effects.throws(thrown);

                try {
                    forwardStateSpaceSearch._applyActionToNode(node, callback);
                } catch (error) {
                    err = error;
                }

                expect(err).to.deep.equal(thrown);
            });
        });
        describe('if the parameters are not an array', function() {
            it('it should call action.effects with node state passed in', function() {
                action.parameters = {};

                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0]).to.deep.equal([stateObj]);
            });
            it('should throw an error if the action effects throws an error', function() {
                let thrown = new Error('ERROR_THROWN');
                let err;
                action.parameters = {};
                action.effects.throws(thrown);

                try {
                    forwardStateSpaceSearch._applyActionToNode(node, callback);
                } catch (error) {
                    err = error;
                }

                expect(err).to.deep.equal(thrown);
            });
        });
    });

    describe('_testForGoal', function() {
        let next;
        let callback;
        let planningProblem;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            planningProblem = {
                goalActions: {
                    has: sinon.stub(),
                    delete: sinon.stub(),
                },
                foundGoalActions: {
                    has: sinon.stub(),
                    add: sinon.stub(),
                },
                callback: sinon.stub(),
            };
            callback = sinon.stub();

            mockery.registerMock('uuid/v4', {});
            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call goalActions.has once with node.lastAction as the parameter', function() {
            let generator = forwardStateSpaceSearch._testForGoal(planningProblem, {lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(planningProblem.goalActions.has.args).to.deep.equal([['MY_ACTION']]);
        });

        it('should call foundGoalActions.has once with node.lastAction as the parameter', function() {
            planningProblem.goalActions.has.returns(true);
            let generator = forwardStateSpaceSearch._testForGoal(planningProblem, {lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(planningProblem.foundGoalActions.has.args).to.deep.equal([['MY_ACTION']]);
        });

        it('should call the passed in callback once with no parameters', function() {
            let generator = forwardStateSpaceSearch._testForGoal(planningProblem, {lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(callback.args).to.deep.equal([[]]);
        });

        describe('if both goalActions.has returns true and foundGoalActions.has return false', function() {
            it('should call foundGoalActions.add once with node.lastAction as the parameter', function() {
                planningProblem.goalActions.has.returns(true);
                planningProblem.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);

                expect(planningProblem.foundGoalActions.add.args).to.deep.equal([['MY_ACTION']]);
            });

            it('should call goalActions.delete once with node.lastAction as the parameter', function() {
                planningProblem.goalActions.has.returns(true);
                planningProblem.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);

                expect(planningProblem.goalActions.delete.args).to.deep.equal([['MY_ACTION']]);
            });

            it('should call planningProblem.callback once with the parameters null and the result ' +
                'of the next yield', function() {
                planningProblem.goalActions.has.returns(true);
                planningProblem.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);
                generator.next('myClonedNode');

                expect(planningProblem.callback.args).to.deep.equal([[null, 'myClonedNode']]);
            });

            it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.cloneSearchNode\'' +
                ', the passed in node, and the next callback', function() {
                planningProblem.goalActions.has.returns(true);
                planningProblem.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);

                expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                    [
                        'forwardStateSpaceSearch.cloneSearchNode',
                        {
                            lastAction: 'MY_ACTION',
                        },
                        next,
                    ],
                ]);
            });
        });

        describe('if goalActions.has returnse false and foundGoalActions.has returns true', function() {
            it('should call planningProblem.callback 0 times', function() {
                planningProblem.goalActions.has.returns(false);
                planningProblem.foundGoalActions.has.returns(true);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);
                generator.next('myClonedNode');

                expect(planningProblem.callback.args).to.deep.equal([]);
            });
        });

        describe('if goalActions.has returns true and foundGoalActions.has returns true', function() {
            it('should call planningProblem.callback 0 times', function() {
                planningProblem.goalActions.has.returns(true);
                planningProblem.foundGoalActions.has.returns(true);
                let generator = forwardStateSpaceSearch._testForGoal(
                    planningProblem, {lastAction: 'MY_ACTION'}, callback
                );

                generator.next();
                generator.next(next);
                generator.next('myClonedNode');

                expect(planningProblem.callback.args).to.deep.equal([]);
            });
        });
    });
});
