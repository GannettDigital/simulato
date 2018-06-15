'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-algorithms/forward-state-space-search-heuristic.js', function() {
    describe('on file require', function() {
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should Emitter.mixIn once with startNodes as the parameter', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(Emitter.mixIn.args).to.deep.equal([
                [forwardStateSpaceSearch],
            ]);
        });

        it('should call fowardStateSpaceSearch 5 times', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.callCount).to.equal(5);
        });

        it('should call forwardStateSpaceSearch.on 3 times', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.on.callCount).to.equal(3);
        });

        it('should call forwardStateSpaceSearch.runOn with the event \'forwardStateSpaceSearch.findGoalActions' +
            '\' and forwardStateSpaceSearch._findGoalActions', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.args[0]).to.deep.equal([
                'forwardStateSpaceSearch.findGoalActions',
                forwardStateSpaceSearch._findGoalActions,
            ]);
        });

        it('should call forwardStateSpaceSearch.runOn with the event \'forwardStateSpaceSearch.testForGoal' +
            '\' and forwardStateSpaceSearch._testForGoal', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.args[1]).to.deep.equal([
                'forwardStateSpaceSearch.testForGoal',
                forwardStateSpaceSearch._testForGoal,
            ]);
        });

        it('should call forwardStateSpaceSearch.runOn with the event \'forwardStateSpaceSearch.createPlans' +
            '\' and forwardStateSpaceSearch._createPlans', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.args[2]).to.deep.equal([
                'forwardStateSpaceSearch.createPlans',
                forwardStateSpaceSearch._createPlans,
            ]);
        });

        it('should call forwardStateSpaceSearch.on with the event \'forwardStateSpaceSearch.setNodeInMap' +
            '\' and forwardStateSpaceSearch._setNodeInMap', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.on.args[0]).to.deep.equal([
                'forwardStateSpaceSearch.setNodeInMap',
                forwardStateSpaceSearch._setNodeInMap,
            ]);
        });

        it('should call forwardStateSpaceSearch.runOn with the event \'forwardStateSpaceSearch.getNodeFromMap' +
            '\' and forwardStateSpaceSearch._getNodeFromMap', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.args[3]).to.deep.equal([
                'forwardStateSpaceSearch.getNodeFromMap',
                forwardStateSpaceSearch._getNodeFromMap,
            ]);
        });

        it('should call forwardStateSpaceSearch.runOn with the event \'forwardStateSpaceSearch.findNextNode' +
            '\' and forwardStateSpaceSearch._findNextNode', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.runOn.args[4]).to.deep.equal([
                'forwardStateSpaceSearch.findNextNode',
                forwardStateSpaceSearch._findNextNode,
            ]);
        });

        it('should call forwardStateSpaceSearch.on with the event \'forwardStateSpaceSearch.findUnfoundGoalActionCo' +
            'unt\' and forwardStateSpaceSearch._findUnfoundGoalActionCount', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.on.args[1]).to.deep.equal([
                'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                forwardStateSpaceSearch._findUnfoundGoalActionCount,
            ]);
        });

        it('should call forwardStateSpaceSearch.on with the event \'forwardStateSpaceSearch.addActions' +
            '\' and forwardStateSpaceSearch._addActions', function() {
            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            expect(forwardStateSpaceSearch.on.args[2]).to.deep.equal([
                'forwardStateSpaceSearch.addActions',
                forwardStateSpaceSearch._addActions,
            ]);
        });
    });

    describe('_createPlans', function() {
        let callback;
        let next;
        let Emitter;
        let forwardStateSpaceSearch;
        let startNodes;
        let configHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            callback = sinon.stub();
            next = sinon.stub();
            configHandler = {
                get: sinon.stub(),
            };

            startNodes = [
                {
                    allActions: new Set(['ACTION_1', 'ACTION_2']),
                },
            ];

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', configHandler);

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set forwardStateSpaceSearch.callback to the passed in callback', function() {
            let generator = forwardStateSpaceSearch._createPlans(callback);

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.callback).to.deep.equal(callback);
        });

        it('should call configHandler.get once with \'actionToCover\'', function() {
            let generator = forwardStateSpaceSearch._createPlans(callback);

            generator.next();
            generator.next(next);

            expect(configHandler.get.args).to.deep.equal([['actionToCover']]);
        });

        describe('if configHandler.get(\'actionToCover\') is truthy', function() {
            it('should set forwardStateSpaceSearch.predeterminedGoalAction to the passed in ' +
                'predeterminedGoalAction', function() {
                let generator = forwardStateSpaceSearch._createPlans(callback);
                configHandler.get.returns('component.ACTION');

                generator.next();
                generator.next(next);

                expect(forwardStateSpaceSearch.predeterminedGoalAction).to.equal('component.ACTION');
            });
        });


        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.getStartNodes\' ' +
            'and next', function() {
            let generator = forwardStateSpaceSearch._createPlans(callback);

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.emitAsync.args[0]).to.deep.equal([
                'forwardStateSpaceSearch.getStartNodes',
                next,
            ]);
        });

        describe('for each startNode in startNodes', function() {
            it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.addActions\' ' +
                'startNode.allActions, and next', function() {
                let generator = forwardStateSpaceSearch._createPlans(callback);

                generator.next();
                generator.next(next);
                generator.next(startNodes);

                expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
                    'forwardStateSpaceSearch.addActions',
                    startNodes[0].allActions,
                    next,
                ]);
            });

            it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.findUnfound' +
                'GoalActionCount\' startNode, and next', function() {
                let generator = forwardStateSpaceSearch._createPlans(callback);

                generator.next();
                generator.next(next);
                generator.next(startNodes);
                generator.next();

                expect(forwardStateSpaceSearch.emitAsync.args[2]).to.deep.equal([
                    'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                    startNodes[0],
                    next,
                ]);
            });

            it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.setNodeInMap ' +
                ' startNode, unfoundGoalActionCount, and next', function() {
                let generator = forwardStateSpaceSearch._createPlans(callback);

                generator.next();
                generator.next(next);
                generator.next(startNodes);
                generator.next();
                generator.next(4);

                expect(forwardStateSpaceSearch.emitAsync.args[3]).to.deep.equal([
                    'forwardStateSpaceSearch.setNodeInMap',
                    startNodes[0],
                    4,
                    next,
                ]);
            });
        });

        describe('if there are two startNodes', function() {
            it('should call forwardStateSpaceSearch.emitAsync 8 times', function() {
                startNodes.push({allActions: new Set(['ACTION_5', 'ACTION_7'])});
                let generator = forwardStateSpaceSearch._createPlans(callback);

                generator.next();
                generator.next(next);
                generator.next(startNodes);
                generator.next();
                generator.next(4);
                generator.next();
                generator.next();
                generator.next();
                generator.next();

                expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(8);
            });
        });

        describe('if there is one startNode', function() {
            it('should call forwardStateSpaceSearch.emitAsync 5 times', function() {
                let generator = forwardStateSpaceSearch._createPlans(callback);

                generator.next();
                generator.next(next);
                generator.next(startNodes);
                generator.next();
                generator.next(4);
                generator.next();

                expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(5);
            });
        });

        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
            'findGoalActions\'', function() {
            let generator = forwardStateSpaceSearch._createPlans(callback);

            generator.next();
            generator.next(next);
            generator.next(startNodes);
            generator.next();
            generator.next(4);
            generator.next();

            expect(forwardStateSpaceSearch.emitAsync.args[4]).to.deep.equal([
                'forwardStateSpaceSearch.findGoalActions',
            ]);
        });
    });

    describe('_addActions', function() {
        let callback;
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

            forwardStateSpaceSearch = require(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );
        });

        afterEach(function() {
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
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            next = sinon.stub();
            global.SimulatoError = {
                PLANNER: {
                    GOAL_NOT_FOUND: sinon.stub(),
                },
            };

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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

        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
            'getNodeFromMap\' and the next callback', function() {
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);

            expect(forwardStateSpaceSearch.emitAsync.args[0]).to.deep.equal([
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
                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
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

                    expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
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

                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                    'applyEffects\', clonedNode, and the next callback', function() {
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

                    expect(forwardStateSpaceSearch.emitAsync.args[2]).to.deep.equal([
                        'forwardStateSpaceSearch.applyEffects',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
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

                    expect(forwardStateSpaceSearch.emitAsync.args[3]).to.deep.equal([
                        'forwardStateSpaceSearch.getPossibleActions',
                        {
                            actions: new Set(),
                            path: ['myComponent.MY_ACTION'],
                        },
                        next,
                    ]);
                });

                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
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

                    expect(forwardStateSpaceSearch.emitAsync.args[5]).to.deep.equal([
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
                    it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
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

                        expect(forwardStateSpaceSearch.emitAsync.args[6]).to.deep.equal([
                            'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                            {
                                actions: new Set(),
                                path: ['myComponent.MY_ACTION'],
                            },
                            next,
                        ]);
                    });

                    it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
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

                        expect(forwardStateSpaceSearch.emitAsync.args[7]).to.deep.equal([
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
                        it('should call have called forwardStateSpaceSearch.emitAsync 8 times', function() {
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

                            expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(8);
                        });
                    });
                });
            });

            it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                'findGoalActions\' once', function() {
                let node = {
                    actions: new Set(),
                };
                let generator = forwardStateSpaceSearch._findGoalActions();

                generator.next();
                generator.next(next);
                generator.next(node);

                expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
                    'forwardStateSpaceSearch.findGoalActions',
                ]);
            });
        });
    });

    describe('_testForGoal', function() {
        let next;
        let callback;
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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

                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                    'cloneSearchNode\', the passed in node, and the next callback', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

                    generator.next();
                    generator.next(next);

                    expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
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

                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch' +
                    '.cloneSearchNode\', the passed in node, and the next callback', function() {
                    forwardStateSpaceSearch.goalActions.has.returns(true);
                    forwardStateSpaceSearch.foundGoalActions.has.returns(false);
                    forwardStateSpaceSearch.predeterminedGoalAction = 'MY_ACTION';
                    let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

                    generator.next();
                    generator.next(next);

                    expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
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
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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
                        it('should call forwardStateSpaceSearch.emitAsync with the event' +
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

                            expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
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
                        it('should NOT call forwardStateSpaceSearch.emitAsync with the event' +
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

                            expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(0);
                        });
                    });
                });
                describe('for each actionArray that has a 0 element', function() {
                    it('should call forwardStateSpaceSearch.emitAsync with the event' +
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

                        expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
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
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            next = sinon.stub();
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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
            it('should call fowardStateSpaceSearch.emitAsync once with the event \'forwardStateSpaceSearch.' +
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

                expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
                    [
                        'forwardStateSpaceSearch.findUnfoundGoalActionCount',
                        {name: 'node3'},
                        next,
                    ],
                ]);
            });

            describe('if the returned unfoundGoalActionCount is the same as passed in currentActionsCount', function() {
                it('shoud NOT forwardStateSpaceSearch.emitAsync with call the event ' +
                    '\'forwardStateSpaceSearch.setNodeInMap\'', function() {
                    let nodesArray = [
                        {name: 'node1'},
                        {name: 'node2'},
                        {name: 'node3'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(3);

                    expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
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
                it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                    'setNodeInMap\' for each node comes back with a different count', function() {
                    let nodesArray = [
                        {name: 'node1'},
                    ];

                    let generator = forwardStateSpaceSearch._findNextNode(nodesArray, 3, callback);
                    generator.next();
                    generator.next(next);
                    generator.next(2);
                    generator.next();

                    expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
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
        let Emitter;
        let forwardStateSpaceSearch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            callback = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});

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
