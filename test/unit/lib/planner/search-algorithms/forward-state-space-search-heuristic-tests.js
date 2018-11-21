'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-algorithms/forward-state-space-search-heuristic.js', function() {
  describe('on file require', function() {
    let Emitter;
    let plannerEventDispatch;
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
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with forwardStateSpaceSearch and plannerEventDispatch ' +
            'as parameters', function() {
      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          forwardStateSpaceSearch,
          plannerEventDispatch,
        ],
      ]);
    });

    it('should call fowardStateSpaceSearch.runOn 2 times', function() {
      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      expect(forwardStateSpaceSearch.runOn.callCount).to.equal(2);
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
  });

  describe('createPlans', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      forwardStateSpaceSearch._addActions = sinon.stub();
      forwardStateSpaceSearch._findUnfoundGoalActionCount = sinon.stub();
      forwardStateSpaceSearch._setNodeInMap = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set forwardStateSpaceSearch._callback to the passed in callback', function() {
      let generator = forwardStateSpaceSearch.createPlans(callback);

      generator.next();
      generator.next(next);

      expect(forwardStateSpaceSearch._callback).to.deep.equal(callback);
    });

    it('should call configHandler.get once with \'actionToCover\'', function() {
      let generator = forwardStateSpaceSearch.createPlans(callback);

      generator.next();
      generator.next(next);

      expect(configHandler.get.args).to.deep.equal([['actionToCover']]);
    });

    describe('if configHandler.get(\'actionToCover\') is truthy', function() {
      it('should set forwardStateSpaceSearch._predeterminedGoalAction to the passed in ' +
                'predeterminedGoalAction', function() {
        let generator = forwardStateSpaceSearch.createPlans(callback);
        configHandler.get.returns('component.ACTION');

        generator.next();
        generator.next(next);

        expect(forwardStateSpaceSearch._predeterminedGoalAction).to.equal('component.ACTION');
      });
    });


    it('should call forwardStateSpaceSearch.emitAsync with the event \'startNodes.get\' ' +
            'and next', function() {
      let generator = forwardStateSpaceSearch.createPlans(callback);

      generator.next();
      generator.next(next);

      expect(forwardStateSpaceSearch.emitAsync.args[0]).to.deep.equal([
        'startNodes.get',
        next,
      ]);
    });

    describe('for each startNode in startNodes', function() {
      it('should call forwardStateSpaceSearch._addActions once with startNode.allActions', function() {
        let generator = forwardStateSpaceSearch.createPlans(callback);

        generator.next();
        generator.next(next);
        generator.next(startNodes);

        expect(forwardStateSpaceSearch._addActions.args).to.deep.equal([
          [
            startNodes[0].allActions,
          ],
        ]);
      });

      it('should call forwardStateSpaceSearch._findUnfoundGoalActionCount once with the startNode', function() {
        let generator = forwardStateSpaceSearch.createPlans(callback);

        generator.next();
        generator.next(next);
        generator.next(startNodes);
        generator.next();

        expect(forwardStateSpaceSearch._findUnfoundGoalActionCount.args).to.deep.equal([
          [
            startNodes[0],
          ],
        ]);
      });

      it('should call forwardStateSpaceSearch._setNodeInMap once with startNode and ' +
        'unfoundGoalActionCount', function() {
        forwardStateSpaceSearch._findUnfoundGoalActionCount.returns(4);
        let generator = forwardStateSpaceSearch.createPlans(callback);

        generator.next();
        generator.next(next);
        generator.next(startNodes);
        generator.next();

        expect(forwardStateSpaceSearch._setNodeInMap.args).to.deep.equal([
          [
            startNodes[0],
            4,
          ],
        ]);
      });
    });

    it('should call forwardStateSpaceSearch.emitAsync 2 times', function() {
      let generator = forwardStateSpaceSearch.createPlans(callback);

      generator.next();
      generator.next(next);
      generator.next(startNodes);
      generator.next();

      expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(2);
    });

    it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
            'findGoalActions\'', function() {
      let generator = forwardStateSpaceSearch.createPlans(callback);

      generator.next();
      generator.next(next);
      generator.next(startNodes);
      generator.next();

      expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
        'forwardStateSpaceSearch.findGoalActions',
      ]);
    });
  });

  describe('_addActions', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

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

          forwardStateSpaceSearch._addActions(actions);

          expect(forwardStateSpaceSearch._goalActions).to.deep.equal(
              new Set(['myComponent.MY_ACTION'])
          );
        });
      });

      describe('if discoveredActions.has returns true', function() {
        it('should not add it to goalActions', function() {
          let actions = new Set(['myComponent.MY_ACTION']);
          forwardStateSpaceSearch._discoveredActions.add('myComponent.MY_ACTION');

          forwardStateSpaceSearch._addActions(actions);

          expect(forwardStateSpaceSearch._goalActions).to.deep.equal(new Set());
        });
      });

      it('should add the passed in action to discoveredActions', function() {
        let actions = new Set(['myComponent.MY_ACTION', 'myComponent.MY_ACTION_2']);

        forwardStateSpaceSearch._addActions(actions);

        expect(forwardStateSpaceSearch._goalActions).to.deep.equal(
            new Set(['myComponent.MY_ACTION', 'myComponent.MY_ACTION_2'])
        );
      });
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      forwardStateSpaceSearch._getNodeFromMap = sinon.stub().returns({
        actions: new Set([
          'myComponent.MY_ACTION',
        ]),
      });
      forwardStateSpaceSearch._addActions = sinon.stub();
      forwardStateSpaceSearch._findUnfoundGoalActionCount = sinon.stub();
      forwardStateSpaceSearch._setNodeInMap = sinon.stub();
      forwardStateSpaceSearch._callback = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call forwardStateSpaceSearch._getNodeFromMap once with no parameters', function() {
      let generator = forwardStateSpaceSearch._findGoalActions();

      generator.next();
      generator.next(next);

      expect(forwardStateSpaceSearch._getNodeFromMap.args).to.deep.equal([[]]);
    });

    describe('if no node is returned from getNodeFromMap', function() {
      it('should throw an error', function() {
        let error = new Error('My Error');
        let thrownError;
        global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
        forwardStateSpaceSearch._getNodeFromMap.returns(null);
        let generator = forwardStateSpaceSearch._findGoalActions();

        generator.next();
        try {
          generator.next(next);
        } catch (err) {
          thrownError = err;
        }

        expect(thrownError).to.deep.equal(error);
      });

      it('should call global.SimulatoError.PLANNER.GOAL_NOT_FOUND once with the goals not found', function() {
        forwardStateSpaceSearch._goalActions.add('componentInstance.MY_ACTION');
        forwardStateSpaceSearch._goalActions.add('componentInstance2.MY_OTHER_ACTION');
        let error = new Error('My Error');
        global.SimulatoError.PLANNER.GOAL_NOT_FOUND.throws(error);
        forwardStateSpaceSearch._getNodeFromMap.returns(null);
        let generator = forwardStateSpaceSearch._findGoalActions();

        generator.next();
        try {
          generator.next(next);
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
        it('should call forwardStateSpaceSearch.emitAsync with the event \'searchNode.clone\' ' +
                    'the node, and the next callback', function() {
          let generator = forwardStateSpaceSearch._findGoalActions();

          generator.next();
          generator.next(next);

          expect(forwardStateSpaceSearch.emitAsync.args[0]).to.deep.equal([
            'searchNode.clone',
            {
              actions: new Set([
                'myComponent.MY_ACTION',
              ]),
            },
            next,
          ]);
        });

        it('should set clonedNode.actions to an empty set', function() {
          let clonedNode = {path: []};
          let generator = forwardStateSpaceSearch._findGoalActions();

          generator.next();
          generator.next(next);
          generator.next(clonedNode);

          expect(clonedNode.actions).to.deep.equal(new Set());
        });

        it('should call clonedNode.path.push once with the action', function() {
          let clonedNode = {
            path: {
              push: sinon.stub(),
            },
          };
          let generator = forwardStateSpaceSearch._findGoalActions();

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

        it('should call forwardStateSpaceSearch.emitAsync with the event \'planner.applyEffects\' ' +
                    'clonedNode, and the next callback', function() {
          let clonedNode = {path: []};
          let generator = forwardStateSpaceSearch._findGoalActions();

          generator.next();
          generator.next(next);
          generator.next(clonedNode);

          expect(forwardStateSpaceSearch.emitAsync.args[1]).to.deep.equal([
            'planner.applyEffects',
            {
              actions: new Set(),
              path: ['myComponent.MY_ACTION'],
            },
            next,
          ]);
        });

        it('should call forwardStateSpaceSearch.emitAsync with the event \'possibleActions.' +
                    'get\', clonedNode, and the next callback', function() {
          let clonedNode = {path: []};
          let generator = forwardStateSpaceSearch._findGoalActions();

          generator.next();
          generator.next(next);
          generator.next(clonedNode);
          generator.next();

          expect(forwardStateSpaceSearch.emitAsync.args[2]).to.deep.equal([
            'possibleActions.get',
            {
              actions: new Set(),
              path: ['myComponent.MY_ACTION'],
            },
            next,
          ]);
        });

        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                    'testForGoal\', clonedNode, and the next callback', function() {
          let clonedNode = {path: []};
          let generator = forwardStateSpaceSearch._findGoalActions();

          generator.next();
          generator.next(next);
          generator.next(clonedNode);
          generator.next();
          generator.next({applicableActions: new Set(), allActions: new Set()});

          expect(forwardStateSpaceSearch.emitAsync.args[3]).to.deep.equal([
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
            let clonedNode = {path: []};
            forwardStateSpaceSearch._callback = sinon.stub();
            forwardStateSpaceSearch._discoveredActions = new Set();
            forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
            forwardStateSpaceSearch._foundGoalActions = new Set();
            forwardStateSpaceSearch._foundGoalActions.add('myComponent.SOME_ACTION');
            let returnedActions = new Set();
            returnedActions.add('myComponent.SOME_ACTION');
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);
            generator.next(clonedNode);
            generator.next();
            generator.next({applicableActions: new Set(), allActions: new Set()});
            generator.next();

            expect(forwardStateSpaceSearch._callback.args).to.deep.equal([
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
            let clonedNode = {path: []};
            forwardStateSpaceSearch._callback = sinon.stub();
            forwardStateSpaceSearch._discoveredActions = new Set();
            forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
            forwardStateSpaceSearch._foundGoalActions = {
              has: sinon.stub().returns(true),
            };
            forwardStateSpaceSearch._predeterminedGoalAction = 'myComponent.SOME_ACTION';
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);
            generator.next(clonedNode);
            generator.next();
            generator.next({applicableActions: new Set(), allActions: new Set()});
            generator.next();

            expect(forwardStateSpaceSearch._foundGoalActions.has.args).to.deep.equal([
              ['myComponent.SOME_ACTION'],
            ]);
          });

          it('should call the forwardStateSpaceSearch callback once with null, null, true, and ' +
                        'discoveredActions as the parameters', function() {
            let clonedNode = {path: []};
            forwardStateSpaceSearch._callback = sinon.stub();
            forwardStateSpaceSearch._discoveredActions = new Set();
            forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
            forwardStateSpaceSearch._foundGoalActions = {
              has: sinon.stub().returns(true),
            };
            forwardStateSpaceSearch._predeterminedGoalAction = 'myComponent.SOME_ACTION';
            let returnedActions = new Set();
            returnedActions.add('myComponent.SOME_ACTION');
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);
            generator.next(clonedNode);
            generator.next();
            generator.next({applicableActions: new Set(), allActions: new Set()});
            generator.next();

            expect(forwardStateSpaceSearch._callback.args).to.deep.equal([
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
          it('should call forwardStateSpaceSearch._findUnfoundGoalActionCount once with ' +
                        'the clonedNode', function() {
            let clonedNode = {path: []};
            forwardStateSpaceSearch._discoveredActions = new Set();
            forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
            forwardStateSpaceSearch._foundGoalActions = new Set();
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);
            generator.next(clonedNode);
            generator.next();
            generator.next({applicableActions: new Set(), allActions: new Set()});
            generator.next();

            expect(forwardStateSpaceSearch._findUnfoundGoalActionCount.args).to.deep.equal([
              [
                {
                  actions: new Set(),
                  path: ['myComponent.MY_ACTION'],
                },
              ],
            ]);
          });

          it('should call forwardStateSpaceSearch._setNodeInMap once with ' +
                        'the clonedNode and unfoundGoalActionCount', function() {
            let clonedNode = {path: []};
            forwardStateSpaceSearch._discoveredActions = new Set();
            forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
            forwardStateSpaceSearch._foundGoalActions = new Set();
            forwardStateSpaceSearch._findUnfoundGoalActionCount.returns(1);
            let generator = forwardStateSpaceSearch._findGoalActions();

            generator.next();
            generator.next(next);
            generator.next(clonedNode);
            generator.next();
            generator.next({applicableActions: new Set(), allActions: new Set()});
            generator.next();

            expect(forwardStateSpaceSearch._setNodeInMap.args).to.deep.equal([
              [
                {
                  actions: new Set(),
                  path: ['myComponent.MY_ACTION'],
                },
                1,
              ],
            ]);
          });

          describe('if there was only 1 action', function() {
            it('should call have called forwardStateSpaceSearch.emitAsync 5 times', function() {
              let clonedNode = {path: []};
              forwardStateSpaceSearch._discoveredActions = new Set();
              forwardStateSpaceSearch._discoveredActions.add('myComponent.SOME_ACTION');
              forwardStateSpaceSearch._foundGoalActions = new Set();
              let generator = forwardStateSpaceSearch._findGoalActions();

              generator.next();
              generator.next(next);
              generator.next(clonedNode);
              generator.next();
              generator.next({applicableActions: new Set(), allActions: new Set()});
              generator.next();
              generator.next();

              expect(forwardStateSpaceSearch.emitAsync.callCount).to.equal(5);
            });
          });
        });
      });

      it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                'findGoalActions\'', function() {
        forwardStateSpaceSearch._getNodeFromMap.returns({
          actions: new Set(),
        });
        let generator = forwardStateSpaceSearch._findGoalActions();

        generator.next();
        generator.next(next);

        expect(forwardStateSpaceSearch.emitAsync.args[0]).to.deep.equal([
          'forwardStateSpaceSearch.findGoalActions',
        ]);
      });
    });
  });

  describe('_testForGoal', function() {
    let next;
    let callback;
    let Emitter;
    let configHandler;
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
      configHandler = {
        get: sinon.stub(),
      };
      sinon.spy(console, 'log');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      forwardStateSpaceSearch._goalActions.has = sinon.stub();
      forwardStateSpaceSearch._foundGoalActions.has = sinon.stub();
      forwardStateSpaceSearch._foundGoalActions.add = sinon.stub();
      forwardStateSpaceSearch._goalActions.delete = sinon.stub();
      forwardStateSpaceSearch._callback = sinon.stub();
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call goalActions.has once with node.lastAction as the parameter', function() {
      let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

      generator.next();
      generator.next(next);

      expect(forwardStateSpaceSearch._goalActions.has.args).to.deep.equal([['MY_ACTION']]);
    });

    it('should call foundGoalActions.has once with node.lastAction as the parameter', function() {
      forwardStateSpaceSearch._goalActions.has.returns(true);
      let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

      generator.next();
      generator.next(next);

      expect(forwardStateSpaceSearch._foundGoalActions.has.args).to.deep.equal([['MY_ACTION']]);
    });

    it('should call the passed in callback once with no parameters', function() {
      let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

      generator.next();
      generator.next(next);

      expect(callback.args).to.deep.equal([[]]);
    });

    describe('if both goalActions.has returns true and foundGoalActions.has return false', function() {
      it('should call foundGoalActions.add once with node.lastAction as the parameter', function() {
        forwardStateSpaceSearch._goalActions.has.returns(true);
        forwardStateSpaceSearch._foundGoalActions.has.returns(false);
        let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

        generator.next();
        generator.next(next);

        expect(forwardStateSpaceSearch._foundGoalActions.add.args).to.deep.equal([['MY_ACTION']]);
      });

      it('should call goalActions.delete once with node.lastAction as the parameter', function() {
        forwardStateSpaceSearch._goalActions.has.returns(true);
        forwardStateSpaceSearch._foundGoalActions.has.returns(false);
        let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

        generator.next();
        generator.next(next);

        expect(forwardStateSpaceSearch._goalActions.delete.args).to.deep.equal([['MY_ACTION']]);
      });

      it('should call configHandler.get once with the string \'debug\' as the parameter', function() {
        forwardStateSpaceSearch._goalActions.has.returns(true);
        forwardStateSpaceSearch._foundGoalActions.has.returns(false);
        let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

        generator.next();
        generator.next(next);

        expect(configHandler.get.args).to.deep.equal([
          ['debug'],
        ]);
      });

      describe('when configHandler.get returns the boolean true', function() {
        describe('when goalActions.size equals the number 0', function() {
          it('should call console.log with a message reporting that paths to ' +
                        'all actions were discovered', function() {
            configHandler.get.returns(true);
            forwardStateSpaceSearch._goalActions.has.returns(true);
            forwardStateSpaceSearch._foundGoalActions.has.returns(false);
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(console.log.args).to.deep.equal([
              ['\nFound a path to all 0 discovered action(s).'],
            ]);
          });
        });

        describe('when goalActions.size does not equal the number 0', function() {
          it('should call console.log three times', function() {
            configHandler.get.returns(true);
            forwardStateSpaceSearch._goalActions.has.returns(true);
            forwardStateSpaceSearch._foundGoalActions.has.returns(false);
            forwardStateSpaceSearch._goalActions.add('myComponent.MY_ACTION');
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(console.log.callCount).to.equal(3);
          });

          it('should call console.log with a message reporting the number of actions for which paths ' +
                        'have been found', function() {
            configHandler.get.returns(true);
            forwardStateSpaceSearch._goalActions.has.returns(true);
            forwardStateSpaceSearch._foundGoalActions.has.returns(false);
            forwardStateSpaceSearch._goalActions.add('myComponent.MY_ACTION');
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(console.log.args[0]).to.deep.equal([
              '\nFound a path to 0 action(s).',
            ]);
          });

          it('should call console.log with the string \'Searching for a path to:\'', function() {
            configHandler.get.returns(true);
            forwardStateSpaceSearch._goalActions.has.returns(true);
            forwardStateSpaceSearch._foundGoalActions.has.returns(false);
            forwardStateSpaceSearch._goalActions.add('myComponent.MY_ACTION');
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(console.log.args[1]).to.deep.equal([
              'Searching for a path to:',
            ]);
          });

          it('should call console.log with forwardStateSpaceSearch._goalActions', function() {
            configHandler.get.returns(true);
            forwardStateSpaceSearch._goalActions.has.returns(true);
            forwardStateSpaceSearch._foundGoalActions.has.returns(false);
            forwardStateSpaceSearch._goalActions.add('myComponent.MY_ACTION');
            let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

            generator.next();
            generator.next(next);

            expect(console.log.args[2]).to.deep.equal([
              forwardStateSpaceSearch._goalActions,
            ]);
          });
        });
      });

      describe('if forwardStateSpaceSearch._predeterminedGoalAction is null', function() {
        it('should call forwardStateSpaceSearch._callback once with the parameters null and the result ' +
                    'of the next yield', function() {
          forwardStateSpaceSearch._goalActions.has.returns(true);
          forwardStateSpaceSearch._foundGoalActions.has.returns(false);
          let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

          generator.next();
          generator.next(next);
          generator.next('myClonedNode');

          expect(forwardStateSpaceSearch._callback.args).to.deep.equal([[null, 'myClonedNode']]);
        });

        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch.' +
                    'cloneSearchNode\', the passed in node, and the next callback', function() {
          forwardStateSpaceSearch._goalActions.has.returns(true);
          forwardStateSpaceSearch._foundGoalActions.has.returns(false);
          let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

          generator.next();
          generator.next(next);

          expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
            [
              'searchNode.clone',
              {
                lastAction: 'MY_ACTION',
              },
              next,
            ],
          ]);
        });
      });

      describe('if forwardStateSpaceSearch._predeterminedGoalAction is equal to node.lastAction', function() {
        it('should call forwardStateSpaceSearch._callback once with the parameters null and the result ' +
                    'of the next yield', function() {
          forwardStateSpaceSearch._goalActions.has.returns(true);
          forwardStateSpaceSearch._foundGoalActions.has.returns(false);
          forwardStateSpaceSearch._predeterminedGoalAction = 'MY_ACTION';
          let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

          generator.next();
          generator.next(next);
          generator.next('myClonedNode');

          expect(forwardStateSpaceSearch._callback.args).to.deep.equal([[null, 'myClonedNode']]);
        });

        it('should call forwardStateSpaceSearch.emitAsync with the event \'forwardStateSpaceSearch' +
                    '.cloneSearchNode\', the passed in node, and the next callback', function() {
          forwardStateSpaceSearch._goalActions.has.returns(true);
          forwardStateSpaceSearch._foundGoalActions.has.returns(false);
          forwardStateSpaceSearch._predeterminedGoalAction = 'MY_ACTION';
          let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback); 0;

          generator.next();
          generator.next(next);

          expect(forwardStateSpaceSearch.emitAsync.args).to.deep.equal([
            [
              'searchNode.clone',
              {
                lastAction: 'MY_ACTION',
              },
              next,
            ],
          ]);
        });
      });

      describe('if forwardStateSpaceSearch._predeterminedGoalAction not falsey and is not' +
                'equal to node.lastAction', function() {
        it('should not call forward forwardStateSpaceSearch._callback', function() {
          forwardStateSpaceSearch._goalActions.has.returns(true);
          forwardStateSpaceSearch._foundGoalActions.has.returns(false);
          forwardStateSpaceSearch._predeterminedGoalAction = 'MY_AC';
          let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

          generator.next();
          generator.next(next);
          generator.next('myClonedNode');

          expect(forwardStateSpaceSearch._callback.args).to.deep.equal([]);
        });
      });
    });

    describe('if goalActions.has returns false and foundGoalActions.has returns true', function() {
      it('should call forwardStateSpaceSearch._callback 0 times', function() {
        forwardStateSpaceSearch._goalActions.has.returns(false);
        forwardStateSpaceSearch._foundGoalActions.has.returns(true);
        let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

        generator.next();
        generator.next(next);
        generator.next('myClonedNode');

        expect(forwardStateSpaceSearch._callback.args).to.deep.equal([]);
      });
    });

    describe('if goalActions.has returns true and foundGoalActions.has returns true', function() {
      it('should call forwardStateSpaceSearch._callback 0 times', function() {
        forwardStateSpaceSearch._goalActions.has.returns(true);
        forwardStateSpaceSearch._foundGoalActions.has.returns(true);
        let generator = forwardStateSpaceSearch._testForGoal({lastAction: 'MY_ACTION'}, callback);

        generator.next();
        generator.next(next);
        generator.next('myClonedNode');

        expect(forwardStateSpaceSearch._callback.args).to.deep.equal([]);
      });
    });
  });

  describe('_setNodeInMap', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in node testCase.length already exists in' +
            'forwardStateSpaceSearch nodes[testCase.length]', function() {
      describe('if the passed in unfoundGoalActionCount already exists in' +
                'forwardStateSpaceSearch nodes[testCast.length][unfoundGoalActionCount]', function() {
        it('should push the passed in node to that spot in the 3d Array', function() {
          let node = {
            testCase: [0, 1, 2],
          };
          forwardStateSpaceSearch._pathArray = [
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

          forwardStateSpaceSearch._setNodeInMap(node, 1);

          expect(forwardStateSpaceSearch._pathArray).to.deep.equal([
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
          forwardStateSpaceSearch._pathArray = [
            null,
            null,
            null,
            [
              null,
              null,
            ],
          ];

          forwardStateSpaceSearch._setNodeInMap(node, 1);

          expect(forwardStateSpaceSearch._pathArray).to.deep.equal([
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
        forwardStateSpaceSearch._pathArray = [
          null,
          null,
          null,
          null,
        ];

        forwardStateSpaceSearch._setNodeInMap(node, 0);

        expect(forwardStateSpaceSearch._pathArray).to.deep.equal([
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      forwardStateSpaceSearch._findNextNode = sinon.stub();
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
            it('should call forwardStateSpaceSearch._findNextNode with ' +
              'the first available node in the path the number of new actions', function() {
              forwardStateSpaceSearch._pathArray = [
                [
                  [
                    {key: 0},
                  ],
                  [
                    {key: 1}, {key: 2}, {key: 3},
                  ],
                ],
              ];

              forwardStateSpaceSearch._getNodeFromMap();

              expect(forwardStateSpaceSearch._findNextNode.args[0]).to.deep.equal([
                [{key: 1}, {key: 2}, {key: 3}],
                1,
              ]);
            });
            describe('if a node is returned from forwardStateSpaceSearch._findNextNode', function() {
              it('should return that node', function() {
                forwardStateSpaceSearch._findNextNode.onCall(0).returns({key: 3});
                forwardStateSpaceSearch._pathArray = [
                  [
                    [
                      {key: 0},
                    ],
                    [
                      {key: 1}, {key: 2}, {key: 3},
                    ],
                  ],
                ];

                let result = forwardStateSpaceSearch._getNodeFromMap();

                expect(result).to.deep.equal({key: 3});
              });
            });

            describe('if a node is NOT returned from forwardStateSpaceSearch._findNextNode', function() {
              it('it continue looping, calling back with the next node found', function() {
                forwardStateSpaceSearch._findNextNode.onCall(0).returns(null);
                forwardStateSpaceSearch._findNextNode.onCall(1).returns({key: 4});
                forwardStateSpaceSearch._pathArray = [
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

                let result = forwardStateSpaceSearch._getNodeFromMap();

                expect(result).to.deep.equal({key: 4});
              });
            });
          });
          describe('if the element does NOT exist', function() {
            it('should NOT call forwardStateSpaceSearch._findNextNode', function() {
              forwardStateSpaceSearch._pathArray = [
                [
                  null,
                  null,
                ],
              ];

              forwardStateSpaceSearch._getNodeFromMap();

              expect(forwardStateSpaceSearch._findNextNode.callCount).to.equal(0);
            });
          });
        });
        describe('for each actionArray that has a 0 element', function() {
          it('should call forwardStateSpaceSearch._findNextNode with the ' +
                        'first available node and the number of new actions', function() {
            forwardStateSpaceSearch._pathArray = [
              [
                [
                  {key: 0},
                ],
                null,
              ],
            ];

            forwardStateSpaceSearch._getNodeFromMap();

            expect(forwardStateSpaceSearch._findNextNode.args).to.deep.equal([
              [
                [{key: 0}],
                0,
              ],
            ]);
          });
          describe('if a node is returned from forwardStateSpaceSearch._findNextNode', function() {
            it('should call the callback with null and the returned node', function() {
              forwardStateSpaceSearch._findNextNode.onCall(0).returns({key: 0});
              forwardStateSpaceSearch._pathArray = [
                [
                  [
                    {key: 0},
                  ],
                  null,
                ],
              ];

              let result = forwardStateSpaceSearch._getNodeFromMap();

              expect(result).to.deep.equal({key: 0});
            });
          });

          describe('if a node is NOT returned', function() {
            it('it should continue looping, calling back null null if nothing is found', function() {
              forwardStateSpaceSearch._findNextNode.onCall(0).returns(null);
              forwardStateSpaceSearch._pathArray = [
                [
                  [],
                ],
                [
                  [],
                ],
              ];

              let result = forwardStateSpaceSearch._getNodeFromMap();

              expect(result).to.equal(null);
            });
          });
        });
      });
    });
    describe('if pathArray is empty', function() {
      it('should return null', function() {
        forwardStateSpaceSearch._pathArray = [
          null,
        ];

        let result = forwardStateSpaceSearch._getNodeFromMap();

        expect(result).to.equal(null);
      });
    });
  });

  describe('_findNextNode', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

      forwardStateSpaceSearch = require(
          '../../../../../lib/planner/search-algorithms/forward-state-space-search-heuristic.js'
      );

      forwardStateSpaceSearch._findUnfoundGoalActionCount = sinon.stub();
      forwardStateSpaceSearch._setNodeInMap = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('while there are still nodes in the passed in nodesArray', function() {
      it('should call forwardStateSpaceSearch._findUnfoundGoalActionCount with the current node', function() {
        let nodesArray = [
          {name: 'node1'},
          {name: 'node2'},
          {name: 'node3'},
        ];

        forwardStateSpaceSearch._findNextNode(nodesArray, 3);

        expect(forwardStateSpaceSearch._findUnfoundGoalActionCount.args).to.deep.equal([
          [
            {name: 'node3'},
          ],
          [
            {name: 'node2'},
          ],
          [
            {name: 'node1'},
          ],
        ]);
      });

      describe('if the returned unfoundGoalActionCount is the same as passed in currentActionsCount', function() {
        it('shoud NOT call forwardStateSpaceSearch._setNodeInMap', function() {
          forwardStateSpaceSearch._findUnfoundGoalActionCount.returns(3);
          let nodesArray = [
            {name: 'node1'},
            {name: 'node2'},
            {name: 'node3'},
          ];

          forwardStateSpaceSearch._findNextNode(nodesArray, 3);

          expect(forwardStateSpaceSearch._setNodeInMap.callCount).to.deep.equal(0);
        });

        it('should return the most recent node', function() {
          forwardStateSpaceSearch._findUnfoundGoalActionCount.returns(3);
          let nodesArray = [
            {name: 'node1'},
            {name: 'node2'},
            {name: 'node3'},
          ];

          let result = forwardStateSpaceSearch._findNextNode(nodesArray, 3);

          expect(result).to.deep.equal({name: 'node3'});
        });
      });

      describe('if the returned unfoundGoalActionCount is NOT' +
                'the same as passed in currentActionsCount', function() {
        it('should call forwardStateSpaceSearch._setNodeInMap ' +
          ' for each node comes back with a different count', function() {
          forwardStateSpaceSearch._findUnfoundGoalActionCount.onCall(0).returns(1);
          forwardStateSpaceSearch._findUnfoundGoalActionCount.onCall(1).returns(2);
          forwardStateSpaceSearch._findUnfoundGoalActionCount.onCall(2).returns(2);
          let nodesArray = [
            {name: 'node1'},
            {name: 'node2'},
            {name: 'node3'},
          ];

          forwardStateSpaceSearch._findNextNode(nodesArray, 3);

          expect(forwardStateSpaceSearch._setNodeInMap.args).to.deep.equal([
            [
              {name: 'node3'},
              1,
            ],
            [
              {name: 'node2'},
              2,
            ],
            [
              {name: 'node1'},
              2,
            ],
          ]);
        });

        it('should return the null when no node is found', function() {
          forwardStateSpaceSearch._findUnfoundGoalActionCount.returns(0);
          let nodesArray = [
            {name: 'node1'},
          ];

          let result = forwardStateSpaceSearch._findNextNode(nodesArray, 3);

          expect(result).to.equal(null);
        });
      });
    });
  });

  describe('_findUnfoundGoalActionCount', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});

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
      describe('if the action is already in forwardStateSpaceSearch._foundGoalActions', function() {
        it('should decrement the unfoundGoalCount', function() {
          let node = {
            actions: new Set(),
          };
          node.actions.add('component1.Action1');
          node.actions.add('component1.Action2');
          node.actions.add('component1.Action3');
          forwardStateSpaceSearch._foundGoalActions.add('component1.Action2');
          forwardStateSpaceSearch._foundGoalActions.add('component1.Action3');

          let result = forwardStateSpaceSearch._findUnfoundGoalActionCount(node);

          expect(result).to.equal(1);
        });
      });
      describe('if the action are NOT already in forwardStateSpaceSearch._foundGoalActions', function() {
        it('should NOT decrement the unfoundGoalCount', function() {
          let node = {
            actions: new Set(),
          };
          node.actions.add('component1.Action1');
          node.actions.add('component1.Action2');
          node.actions.add('component1.Action3');

          let result = forwardStateSpaceSearch._findUnfoundGoalActionCount(node);

          expect(result).to.equal(3);
        });
      });
    });
  });
});
