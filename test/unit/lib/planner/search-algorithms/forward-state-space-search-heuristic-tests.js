'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-algorithms/forward-state-space-search-heuristic.js', function() {
    describe('_addActions', function() {
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('for each action in the passed in actions', function() {
            describe('if discoveredActions.has returns false', function() {
                it('should add it to goalActions', function() {
                    let actions = new Set(['myComponent.MY_ACTION']);

                    forwardStateSpaceSearch._addActions(actions, callback);

                    expect(forwardStateSpaceSearch.goalActions).to.deep.equal(
                        new Set(['myComponent.MY_ACTION'])
                    );
                });
            });

            describe('if discoveredActions.has returns true', function() {
                it('should not add it to goalActions', function() {
                    let actions = new Set(['myComponent.MY_ACTION']);
                    forwardStateSpaceSearch.discoveredActions.add('myComponent.MY_ACTION');

                    forwardStateSpaceSearch._addActions(actions, callback);

                    expect(forwardStateSpaceSearch.goalActions).to.deep.equal(new Set());
                });
            });

            it('should add the passed in action to discoveredActions', function() {
                let actions = new Set(['myComponent.MY_ACTION', 'myComponent.MY_ACTION_2']);

                forwardStateSpaceSearch._addActions(actions, callback);

                expect(forwardStateSpaceSearch.goalActions).to.deep.equal(
                    new Set(['myComponent.MY_ACTION', 'myComponent.MY_ACTION_2'])
                );
            });
        });

        it('should call the callback once with no arguments', function() {
            let actions = new Set(['myComponent.MY_ACTION']);

            forwardStateSpaceSearch._addActions(actions, callback);

            expect(callback.args).to.deep.equal([[]]);
        });
    });

    describe('_findGoalActions', function() {
        let next;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            global.SimulatoError = {
                PLANNER: {
                    GOAL_NOT_FOUND: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
            'getNodeFromMap\' and the next callback', function() {
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.emit.args[0]).to.deep.equal([
                'forwardStateSpaceSearch.getNodeFromMap',
                next,
            ]);
        });

        describe('if no node is returned from getNodeFromMap', function() {
            it('should throw an error', function() {
                let error = new Error('My Error');
                let thrownError;
                global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
                let generator = forwardStateSpaceSearch._findGoalActions();

                generator.next();
                generator.next(next);
                try {
                    generator.next(null);
                } catch (err) {
                    thrownError = err;
                }

                expect(thrownError).to.deep.equal(error);
            });

            it('should call global.SimulatoError.PLANNER.GOAL_NOT_FOUND once with the goals not found', function() {
                forwardStateSpaceSearch.goalActions.add('componentInstance.MY_ACTION');
                forwardStateSpaceSearch.goalActions.add('componentInstance2.MY_OTHER_ACTION');
                let error = new Error('My Error');
                global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
                let generator = forwardStateSpaceSearch._findGoalActions();

                generator.next();
                generator.next(next);
                try {
                    generator.next(null);
                } catch (err) {}

                expect(global.SimulatoError.PLANNER.GOAL_NOT_FOUND.args).to.deep.equal([
                    [
                        'Planning finished before finding the following goal(s): ' +
                            'componentInstance.MY_ACTION,componentInstance2.MY_OTHER_ACTION',
                    ],
                ]);
            });
        });

        describe('when a node is returned', function() {
            describe('for an action in node.actions.values', function() {
                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'cloneSearchNode\' the node, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
                    generator.next({path: []});

                    expect(forwardStateSpaceSearch.emit.args[1]).to.deep.equal([
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
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
                    generator.next(clonedNode);
                    generator.next();

                    expect(clonedNode.actions).to.deep.equal(new Set());
                });

                it('should call clonedNode.path.push once with the action', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    let clonedNode = {
                        path: {
                            push: sinon.stub(),
                        },
                    };
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
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
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
                    generator.next(clonedNode);

                    expect(forwardStateSpaceSearch.emit.args[2]).to.deep.equal([
                        'forwardStateSpaceSearch.applyActionToNode',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'getPossibleActions\', clonedNode, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
                    generator.next(clonedNode);
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.args[3]).to.deep.equal([
                        'forwardStateSpaceSearch.getPossibleActions',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'testForGoal\', clonedNode, and the next callback', function() {
                    let node = {
                        actions: new Set([
                            'myComponent.MY_ACTION',
                        ]),
                    };
                    let clonedNode = {path: []};
                    let generator = forwardStateSpaceSearch._findGoalActions();

                    generator.next();
                    generator.next(next);
                    generator.next(node);
                    generator.next(clonedNode);
                    generator.next();
                    generator.next({applicableActions: new Set(), allActions: new Set()});
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.args[5]).to.deep.equal([
                        'forwardStateSpaceSearch.testForGoal',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                describe('if predeterminedGoalAction is null and discoveredActions.size is equal to ' +
                    'foundGoalActions.size', function() {
                    it('should call the forwardStateSpaceSearch callback once with null, null, true, and ' +
                        'discoveredActions as the parameters', function() {
                        let node = {
                            actions: new Set([
                                'myComponent.MY_ACTION',
                            ]),
                        };
                        let clonedNode = {path: []};
                        forwardStateSpaceSearch.callback = sinon.stub();
                        forwardStateSpaceSearch.discoveredActions = new Set();
                        forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                        forwardStateSpaceSearch.foundGoalActions = new Set();
                        forwardStateSpaceSearch.foundGoalActions.add('myComponent.SOME_ACTION');
                        let returnedActions = new Set();
                        returnedActions.add('myComponent.SOME_ACTION');
                        let generator = forwardStateSpaceSearch._findGoalActions();

                        generator.next();
                        generator.next(next);
                        generator.next(node);
                        generator.next(clonedNode);
                        generator.next();
                        generator.next({applicableActions: new Set(), allActions: new Set()});
                        generator.next();
                        generator.next();

                        expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                            [
                                null,
                                null,
                                true,
                                returnedActions,
                            ],
                        ]);
                    });
                });

                describe('if predeterminedGoalAction is defined and foundGoalActions.has returns true', function() {
                    it('should call foundGoalActions.has once with the predeterminedGoalAction', function() {
                        let node = {
                            actions: new Set([
                                'myComponent.MY_ACTION',
                            ]),
                        };
                        let clonedNode = {path: []};
                        forwardStateSpaceSearch.callback = sinon.stub();
                        forwardStateSpaceSearch.discoveredActions = new Set();
                        forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                        forwardStateSpaceSearch.foundGoalActions = {
                            has: sinon.stub().returns(true),
                        };
                        forwardStateSpaceSearch.predeterminedGoalAction = 'myComponent.SOME_ACTION';
                        let generator = forwardStateSpaceSearch._findGoalActions();

                        generator.next();
                        generator.next(next);
                        generator.next(node);
                        generator.next(clonedNode);
                        generator.next();
                        generator.next({applicableActions: new Set(), allActions: new Set()});
                        generator.next();
                        generator.next();

                        expect(forwardStateSpaceSearch.foundGoalActions.has.args).to.deep.equal([
                            ['myComponent.SOME_ACTION'],
                        ]);
                    });

                    it('should call the forwardStateSpaceSearch callback once with null, null, true, and ' +
                        'discoveredActions as the parameters', function() {
                        let node = {
                            actions: new Set([
                                'myComponent.MY_ACTION',
                            ]),
                        };
                        let clonedNode = {path: []};
                        forwardStateSpaceSearch.callback = sinon.stub();
                        forwardStateSpaceSearch.discoveredActions = new Set();
                        forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                        forwardStateSpaceSearch.foundGoalActions = {
                            has: sinon.stub().returns(true),
                        };
                        forwardStateSpaceSearch.predeterminedGoalAction = 'myComponent.SOME_ACTION';
                        let returnedActions = new Set();
                        returnedActions.add('myComponent.SOME_ACTION');
                        let generator = forwardStateSpaceSearch._findGoalActions();

                        generator.next();
                        generator.next(next);
                        generator.next(node);
                        generator.next(clonedNode);
                        generator.next();
                        generator.next({applicableActions: new Set(), allActions: new Set()});
                        generator.next();
                        generator.next();

                        expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                            [
                                null,
                                null,
                                true,
                                returnedActions,
                            ],
                        ]);
                    });
                });

                describe('if discoveredActions.size is not equal to foundGoalActions.size and foundGoalActions ' +
                    'does not have the the predeterminedGoalAction', function() {
                    it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                        'findUnfoundGoalActionCount\', clonedNode, and the next callback', function() {
                        let node = {
                            actions: new Set([
                                'myComponent.MY_ACTION',
                            ]),
                        };
                        let clonedNode = {path: []};
                        forwardStateSpaceSearch.discoveredActions = new Set();
                        forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                        forwardStateSpaceSearch.foundGoalActions = new Set();
                        let generator = forwardStateSpaceSearch._findGoalActions();

                        generator.next();
                        generator.next(next);
                        generator.next(node);
                        generator.next(clonedNode);
                        generator.next();
                        generator.next({applicableActions: new Set(), allActions: new Set()});
                        generator.next();
                        generator.next();

                        expect(forwardStateSpaceSearch.emit.args[6]).to.deep.equal([
                            'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                            {
                                actions: new Set(),
                                path: ['myComponent.MY_ACTION'],
                            },
                            next,
                        ]);
                    });

                    it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                        'setNodeInMap\', clonedNode, unfoundGoalActionCount, and the next callback', function() {
                        let node = {
                            actions: new Set([
                                'myComponent.MY_ACTION',
                            ]),
                        };
                        let clonedNode = {path: []};
                        forwardStateSpaceSearch.discoveredActions = new Set();
                        forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                        forwardStateSpaceSearch.foundGoalActions = new Set();
                        let generator = forwardStateSpaceSearch._findGoalActions();

                        generator.next();
                        generator.next(next);
                        generator.next(node);
                        generator.next(clonedNode);
                        generator.next();
                        generator.next({applicableActions: new Set(), allActions: new Set()});
                        generator.next();
                        generator.next();
                        generator.next(1);

                        expect(forwardStateSpaceSearch.emit.args[7]).to.deep.equal([
                            'forwardStateSpaceSearch.setNodeInMap',
                            {
                                actions: new Set(),
                                path: ['myComponent.MY_ACTION'],
                            },
                            1,
                            next,
                        ]);
                    });

                    describe('if there was only 1 action', function() {
                        it('should call have called forwardStateSpaceSearch.emit 8 times', function() {
                            let node = {
                                actions: new Set([
                                    'myComponent.MY_ACTION',
                                ]),
                            };
                            let clonedNode = {path: []};
                            forwardStateSpaceSearch.discoveredActions = new Set();
                            forwardStateSpaceSearch.discoveredActions.add('myComponent.SOME_ACTION');
                            forwardStateSpaceSearch.foundGoalActions = new Set();
                            let generator = forwardStateSpaceSearch._findGoalActions();

                            generator.next();
                            generator.next(next);
                            generator.next(node);
                            generator.next(clonedNode);
                            generator.next();
                            generator.next({applicableActions: new Set(), allActions: new Set()});
                            generator.next();
                            generator.next();
                            generator.next();

                            expect(forwardStateSpaceSearch.emit.callCount).to.equal(8);
                        });
                    });
                });
            });

            it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                'findGoalActions\' once', function() {
                let node = {
                    actions: new Set(),
                };
                let generator = forwardStateSpaceSearch._findGoalActions();

                generator.next();
                generator.next(next);
                generator.next(node);

                expect(forwardStateSpaceSearch.emit.args[1]).to.deep.equal([
                    'forwardStateSpaceSearch.findGoalActions',
                ]);
            });
        });
    });

    describe('_applyActionToNode', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;
        let node;
        let callback;
        let sampleMap;
        let stateObj;
        let action;
        let dataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

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

            dataStore = {
                storedData: 'someData',
            };

            node = {
                path: ['test.ACTION'],
                state: stateObj,
                testCase: {
                    push: sinon.stub(),
                },
                dataStore: dataStore,
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
            it('should call the generate function passing in node.datastore', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.parameters[0].generate.args).to.deep.equal([[
                    dataStore,
                ]]);
            });
            it('should call the generate function with the passed in this context of component', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.parameters[0].generate.thisValues).to.deep.equal([
                    node.state.getComponentsAsMap().get('test'),
                ]);
            });
            it('should call the generate function and produce "parameter"', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0][0]).to.deep.equal('parameter');
            });
            it('should call action effects with the testCaseAction.option.parameters, '
                + 'the node.state, and the node.dataStore', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0]).to.deep.equal(['parameter', stateObj, dataStore]);
            });
            it('should call action effects with the this context of component', function() {
                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.thisValues).to.deep.equal([
                    node.state.getComponentsAsMap().get('test'),
                ]);
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
            it('it should call action.effects with node state and node dataStore passed in', function() {
                action.parameters = {};

                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.args[0]).to.deep.equal([stateObj, dataStore]);
            });

            it('should call action effects with the this context of component', function() {
                action.parameters = {};

                forwardStateSpaceSearch._applyActionToNode(node, callback);

                expect(action.effects.thisValues).to.deep.equal([
                    node.state.getComponentsAsMap().get('test'),
                ]);
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
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            forwardStateSpaceSearch.goalActions.has = sinon.stub();
            forwardStateSpaceSearch.foundGoalActions.has = sinon.stub();
            forwardStateSpaceSearch.foundGoalActions.add = sinon.stub();
            forwardStateSpaceSearch.goalActions.delete = sinon.stub();
            forwardStateSpaceSearch.callback = sinon.stub();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call goalActions.has once with node.lastAction as the parameter', function() {
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.goalActions.has.args).to.deep.equal([['MY_ACTION']]);
        });

        it('should call foundGoalActions.has once with node.lastAction as the parameter', function() {
            forwardStateSpaceSearch.goalActions.has.returns(true);
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.foundGoalActions.has.args).to.deep.equal([['MY_ACTION']]);
        });

        it('should call the passed in callback once with no parameters', function() {
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(callback.args).to.deep.equal([[]]);
        });

        describe('if both goalActions.has returns true and foundGoalActions.has return false', function() {
            it('should call foundGoalActions.add once with node.lastAction as the parameter', function() {
                forwardStateSpaceSearch.goalActions.has.returns(true);
                forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                generator.next();
                generator.next(next);

                expect(forwardStateSpaceSearch.foundGoalActions.add.args).to.deep.equal([['MY_ACTION']]);
            });

            it('should call goalActions.delete once with node.lastAction as the parameter', function() {
                forwardStateSpaceSearch.goalActions.has.returns(true);
                forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                generator.next();
                generator.next(next);

                expect(forwardStateSpaceSearch.goalActions.delete.args).to.deep.equal([['MY_ACTION']]);
            });

            describe('if forwardStateSpaceSearch.predeterminedGoalAction is null', function() {
                it('should call forwardStateSpaceSearch.callback once with the parameters null and the result ' +
                    'of the next yield', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                    generator.next();
                    generator.next(next);
                    generator.next('myClonedNode');

                    expect(forwardStateSpaceSearch.callback.args).to.deep.equal([[null, 'myClonedNode']]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch.' +
                    'cloneSearchNode\', the passed in node, and the next callback', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

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

            describe('if forwardStateSpaceSearch.predeterminedGoalAction is equal to node.lastAction', function() {
                it('should call forwardStateSpaceSearch.callback once with the parameters null and the result ' +
                    'of the next yield', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    forwardStateSpaceSearch.predeterminedGoalAction = 'MY_ACTION';
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                    generator.next();
                    generator.next(next);
                    generator.next('myClonedNode');

                    expect(forwardStateSpaceSearch.callback.args).to.deep.equal([[null, 'myClonedNode']]);
                });

                it('should call forwardStateSpaceSearch.emit with the event \'forwardStateSpaceSearch' +
                    '.cloneSearchNode\', the passed in node, and the next callback', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    forwardStateSpaceSearch.predeterminedGoalAction = 'MY_ACTION';
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

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

            describe('if forwardStateSpaceSearch.predeterminedGoalAction not falsey and is not' +
                'equal to node.lastAction', function() {
                it('should not call forward forwardStateSpaceSearch.callback', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    forwardStateSpaceSearch.predeterminedGoalAction = 'MY_AC';
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                    generator.next();
                    generator.next(next);
                    generator.next('myClonedNode');

                    expect(forwardStateSpaceSearch.callback.args).to.deep.equal([]);
                });
            });
        });

        describe('if goalActions.has returns false and foundGoalActions.has returns true', function() {
            it('should call forwardStateSpaceSearch.callback 0 times', function() {
                forwardStateSpaceSearch.goalActions.has.returns(false);
                forwardStateSpaceSearch.foundGoalActions.has.returns(true);
                let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                generator.next();
                generator.next(next);
                generator.next('myClonedNode');

                expect(forwardStateSpaceSearch.callback.args).to.deep.equal([]);
            });
        });

        describe('if goalActions.has returns true and foundGoalActions.has returns true', function() {
            it('should call forwardStateSpaceSearch.callback 0 times', function() {
                forwardStateSpaceSearch.goalActions.has.returns(true);
                forwardStateSpaceSearch.foundGoalActions.has.returns(true);
                let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

                generator.next();
                generator.next(next);
                generator.next('myClonedNode');

                expect(forwardStateSpaceSearch.callback.args).to.deep.equal([]);
            });
        });
    });

    describe('_setNodeInMap', function() {
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the passed in callback once with no params', function() {
            let node = {
                testCase: [0, 1, 2],
            };
            forwardStateSpaceSearch.pathArray = [
                null,
                null,
                null,
                [
                    null,
                    [
                        {testCase: [3, 2, 1]},
                    ],
                ],
            ];

            forwardStateSpaceSearch._setNodeInMap(node, 1, callback);

            expect(callback.args).to.deep.equal([[]]);
        });

        describe('if the passed in node testCase.length already exists in' +
            'forwardStateSpaceSearch nodes[testCase.length]', function() {
            describe('if the passed in unfoundGoalActionCount already exists in' +
                'forwardStateSpaceSearch nodes[testCast.length][unfoundGoalActionCount]', function() {
                it('should push the passed in node to that spot in the 3d Array', function() {
                    let node = {
                        testCase: [0, 1, 2],
                    };
                    forwardStateSpaceSearch.pathArray = [
                        null,
                        null,
                        null,
                        [
                            null,
                            [
                                {testCase: [3, 2, 1]},
                            ],
                        ],
                    ];

                    forwardStateSpaceSearch._setNodeInMap(node, 1, callback);

                    expect(forwardStateSpaceSearch.pathArray).to.deep.equal([
                        null,
                        null,
                        null,
                        [
                            null,
                            [
                                {testCase: [3, 2, 1]},
                                {testCase: [0, 1, 2]},
                            ],
                        ],
                    ]);
                });
            });
            describe('if the passed in unfoundGoalActionCount does NOT exist in' +
            'forwardStateSpaceSearch nodes[testCast.length][unfoundGoalActionCount]', function() {
                it('should push the create an empty array in that element and' +
                    'passed in node to that spot in the 3d Array', function() {
                    let node = {
                        testCase: [0, 1, 2],
                    };
                    forwardStateSpaceSearch.pathArray = [
                        null,
                        null,
                        null,
                        [
                            null,
                            null,
                        ],
                    ];

                    forwardStateSpaceSearch._setNodeInMap(node, 1, callback);

                    expect(forwardStateSpaceSearch.pathArray).to.deep.equal([
                        null,
                        null,
                        null,
                        [
                            null,
                            [
                                {testCase: [0, 1, 2]},
                            ],
                        ],
                    ]);
                });
            });
        });

        describe('if the passed in node testCase.length does NOT exist in' +
            'forwardStateSpaceSearch nodes[testCase.length]', function() {
            it('should push the create an empty array in that element and' +
                'passed in node to that spot in the 3d Array', function() {
                let node = {
                    testCase: [0, 1, 2],
                };
                forwardStateSpaceSearch.pathArray = [
                    null,
                    null,
                    null,
                    null,
                ];

                forwardStateSpaceSearch._setNodeInMap(node, 0, callback);

                expect(forwardStateSpaceSearch.pathArray).to.deep.equal([
                    null,
                    null,
                    null,
                    [
                        [
                            {testCase: [0, 1, 2]},
                        ],
                    ],
                ]);
            });
        });
    });

    describe('_getNodeFromMap', function() {
        let next;
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('for each pathArray elemen', function() {
            describe('if the element exists', function() {
                describe('for each actionArray element except in element 0', function() {
                    describe('if the element exists', function() {
                        it('should call forwardStateSpaceSearch.emit with the event' +
                            '\'forwardStateSpaceSearch.cloneSearchNode\'' +
                            ', the passed in node, its actionCount, and the next callback', function() {
                            forwardStateSpaceSearch.pathArray = [
                                [
                                    [
                                        {key: 0},
                                    ],
                                    [
                                        {key: 1}, {key: 2}, {key: 3},
                                    ],
                                ],
                            ];
                            let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                            generator.next();
                            generator.next(next);

                            expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                                [
                                    'forwardStateSpaceSearch.findNextNode',
                                    [{key: 1}, {key: 2}, {key: 3}],
                                    1,
                                    next,
                                ],
                            ]);
                        });
                        describe('if a node is returned', function() {
                            it('should call the callback with null and the returned node', function() {
                                forwardStateSpaceSearch.pathArray = [
                                    [
                                        [
                                            {key: 0},
                                        ],
                                        [
                                            {key: 1}, {key: 2}, {key: 3},
                                        ],
                                    ],
                                ];
                                forwardStateSpaceSearch.callback = callback;
                                let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                                generator.next();
                                generator.next(next);
                                generator.next({key: 3});

                                expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                                    [null, {key: 3}],
                                ]);
                            });
                        });

                        describe('if a node is NOT returned', function() {
                            it('it continue looping, calling back with the next node found', function() {
                                forwardStateSpaceSearch.pathArray = [
                                    [
                                        [
                                            {key: 0},
                                        ],
                                        [
                                            {key: 1}, {key: 2}, {key: 3},
                                        ],
                                        [
                                            {key: 4},
                                        ],
                                    ],
                                ];
                                forwardStateSpaceSearch.callback = callback;
                                let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                                generator.next();
                                generator.next(next);
                                generator.next(null);
                                generator.next({key: 4});

                                expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                                    [null, {key: 4}],
                                ]);
                            });
                        });
                    });
                    describe('if the element does NOT exist', function() {
                        it('should NOT call forwardStateSpaceSearch.emit with the event' +
                            '\'forwardStateSpaceSearch.findNextNode\'', function() {
                            forwardStateSpaceSearch.pathArray = [
                                [
                                    null,
                                    null,
                                ],
                            ];
                            let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                            generator.next();
                            generator.next(next);

                            expect(forwardStateSpaceSearch.emit.callCount).to.equal(0);
                        });
                    });
                });
                describe('for each actionArray that has a 0 element', function() {
                    it('should call forwardStateSpaceSearch.emit with the event' +
                        '\'forwardStateSpaceSearch.cloneSearchNode\'' +
                        ', the passed in node, its actionCount, and the next callback', function() {
                        forwardStateSpaceSearch.pathArray = [
                            [
                                [
                                    {key: 0},
                                ],
                                null,
                            ],
                        ];
                        let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                        generator.next();
                        generator.next(next);

                        expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                            [
                                'forwardStateSpaceSearch.findNextNode',
                                [{key: 0}],
                                0,
                                next,
                            ],
                        ]);
                    });
                    describe('if a node is returned', function() {
                        it('should call the callback with null and the returned node', function() {
                            forwardStateSpaceSearch.pathArray = [
                                [
                                    [
                                        {key: 0},
                                    ],
                                    null,
                                ],
                            ];
                            forwardStateSpaceSearch.callback = callback;
                            let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                            generator.next();
                            generator.next(next);
                            generator.next({key: 0});

                            expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                                [null, {key: 0}],
                            ]);
                        });
                    });

                    describe('if a node is NOT returned', function() {
                        it('it should continue looping, calling back null null if nothing is found', function() {
                            forwardStateSpaceSearch.pathArray = [
                                [
                                    [],
                                ],
                                [
                                    [],
                                ],
                            ];
                            forwardStateSpaceSearch.callback = callback;
                            let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                            generator.next();
                            generator.next(next);
                            generator.next(null);
                            generator.next(null);

                            expect(forwardStateSpaceSearch.callback.args).to.deep.equal([
                                [null, null],
                            ]);
                        });
                    });
                });
            });
        });
        describe('if pathArray is empty', function() {
            it('call the callback with null null', function() {
                forwardStateSpaceSearch.pathArray = [
                    null,
                ];
                let generator = forwardStateSpaceSearch._getNodeFromMap(callback);

                generator.next();
                generator.next(next);

                expect(callback.args).to.deep.equal([
                    [
                        null,
                        null,
                    ],
                ]);
            });
        });
    });

    describe('_findNextNode', function() {
        let next;
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('while there are still nodes in the passed in nodesArray', function() {
            it('should call fowardStateSpaceSearch.emit once with the event \'forwardStateSpaceSearch.' +
            'findUnfoundGoalActionCount\', with the popped node from the array, ' +
            'and the next callback', function() {
                let nodesArray = [
                    {name: 'node1'},
                    {name: 'node2'},
                    {name: 'node3'},
                ];

                let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                generator.next();
                generator.next(next);

                expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                    [
                        'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                        {name: 'node3'},
                        next,
                    ],
                ]);
            });

            describe('if the returned unfoundGoalActionCount is the same as passed in currentActionsCount', function() {
                it('shoud NOT call the event \'forwardStateSpaceSearch.setNodeInMap\'', function() {
                    let nodesArray = [
                        {name: 'node1'},
                        {name: 'node2'},
                        {name: 'node3'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(3);

                    expect(forwardStateSpaceSearch.emit.args).to.deep.equal([
                        [
                            'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                            {name: 'node3'},
                            next,
                        ],
                    ]);
                });

                it('should call the callback with the null and the popped node', function() {
                    let nodesArray = [
                        {name: 'node1'},
                        {name: 'node2'},
                        {name: 'node3'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(3);

                    expect(callback.args).to.deep.equal([
                        [null, {name: 'node3'}],
                    ]);
                });
            });

            describe('if the returned unfoundGoalActionCount is NOT' +
                'the same as passed in currentActionsCount', function() {
                it('should call the event \'forwardStateSpaceSearch.setNodeInMap\'' +
                    'for each node comes back with a different count', function() {
                    let nodesArray = [
                        {name: 'node1'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(2);
                    generator.next();

                    expect(forwardStateSpaceSearch.emit.args[1]).to.deep.equal([
                        'forwardStateSpaceSearch.setNodeInMap',
                        {name: 'node1'},
                        2,
                        next,
                    ]);
                });

                it('should call the callback with the null null when no node is found', function() {
                    let nodesArray = [
                        {name: 'node1'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(2);
                    generator.next();

                    expect(callback.args).to.deep.equal([
                        [null, null],
                    ]);
                });
            });
        });
    });

    describe('_findUnfoundGoalActionCount', function() {
        let callback;
        let EventEmitter;
        let EventEmitterInstance;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            callback = sinon.stub();

            mockery.registerMock('events', {EventEmitter});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('for each action in the passed in node', function() {
            describe('if the action is already in forwardStateSpaceSearch.foundGoalActions', function() {
                it('should decrement the unfoundGoalCount that is sent in the callback', function() {
                    let node = {
                        actions: new Set(),
                    };
                    node.actions.add('component1.Action1');
                    node.actions.add('component1.Action2');
                    node.actions.add('component1.Action3');
                    forwardStateSpaceSearch.foundGoalActions.add('component1.Action2');
                    forwardStateSpaceSearch.foundGoalActions.add('component1.Action3');

                    forwardStateSpaceSearch._findUnfoundGoalActionCount(node, callback);

                    expect(callback.args).to.deep.equal([
                        [null, 1],
                    ]);
                });
            });
            describe('if the action are NOT already in forwardStateSpaceSearch.foundGoalActions', function() {
                it('should NOT decrement the unfoundGoalCount that is sent in the callback', function() {
                    let node = {
                        actions: new Set(),
                    };
                    node.actions.add('component1.Action1');
                    node.actions.add('component1.Action2');
                    node.actions.add('component1.Action3');

                    forwardStateSpaceSearch._findUnfoundGoalActionCount(node, callback);

                    expect(callback.args).to.deep.equal([
                        [null, 3],
                    ]);
                });
            });
        });
    });
});
