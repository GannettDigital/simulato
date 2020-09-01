'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-algorithms/offline-replanning.js', function() {
  describe('on file require', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with offlineReplanning and plannerEventDispatch ' +
      'as parameters', function() {
      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          offlineReplanning,
          plannerEventDispatch,
        ],
      ]);
    });

    it('should call offlineReplanning.runOn 3 times', function() {
      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      expect(offlineReplanning.runOn.callCount).to.equal(3);
    });

    it('should call offlineReplanning.runOn with the event \'offlineReplanning.findGoalActions' +
      '\' and offlineReplanning.backtrack', function() {
      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      expect(offlineReplanning.runOn.args[0]).to.deep.equal([
        'offlineReplanning.backtrack',
        offlineReplanning._backtrack,
      ]);
    });

    it('should call offlineReplanning.runOn with the event \'offlineReplanning.updateExistingPlans' +
      'AndActionOccurrences\' and offlineReplanning.updateExistingPlansAndActionOccurrences', function() {
      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      expect(offlineReplanning.runOn.args[1]).to.deep.equal([
        'offlineReplanning.updateExistingPlansAndActionOccurrences',
        offlineReplanning._updateExistingPlansAndActionOccurrences,
      ]);
    });

    it('should call offlineReplanning.runOn with the event \'offlineReplanning.checkForLoopAndBackTrack' +
      '\' and offlineReplanning.checkForLoopAndBackTrack', function() {
      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      expect(offlineReplanning.runOn.args[2]).to.deep.equal([
        'offlineReplanning.checkForLoopAndBackTrack',
        offlineReplanning._checkForLoopAndBackTrack,
      ]);
    });
  });

  describe('replan', function() {
    let Emitter;
    let plannerEventDispatch;
    let configHandler;
    let next;
    let setOperations;
    let crypto;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      configHandler = {
        get: sinon.stub(),
      };
      sinon.spy(console, 'log');
      next = sinon.stub();

      crypto = {
        createHash: sinon.stub(),
      };

      setOperations = {
        isEqual: sinon.stub(),
        isSuperset: sinon.stub(),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', crypto);
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../../util/set-operations.js', setOperations);

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      offlineReplanning._getAction = sinon.stub();
      offlineReplanning._savePlan = sinon.stub();
      offlineReplanning._comparePlan = sinon.stub();
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get with the string "debug"', function() {
      const generator = offlineReplanning.replan();

      generator.next();
      generator.next(next);

      expect(configHandler.get.args[0]).to.deep.equal([
        'debug',
      ]);
    });

    it('should call configHandler.get with the string "replanningSeed"', function() {
      const generator = offlineReplanning.replan();

      generator.next();
      generator.next(next);

      expect(configHandler.get.args[1]).to.deep.equal([
        'replanningSeed',
      ]);
    });

    describe('if configHandler.get returns a truthy value', function() {
      it('should call console.log once with a message about beginning planning', function() {
        configHandler.get.returns(true);
        const generator = offlineReplanning.replan();

        generator.next();
        generator.next(next);

        expect(console.log.args).to.deep.equal([
          [
            '\nBeginning offline replanning\n',
          ],
        ]);
      });
    });

    describe('if configHandler.get returns a falsy value', function() {
      it('should not call console.log', function() {
        configHandler.get.returns(false);
        const generator = offlineReplanning.replan();

        generator.next();
        generator.next(next);

        expect(console.log.callCount).to.equal(0);
      });
    });

    it('should call offlineReplanning.emitAsync with the event "countActions.calculate", offlineReplanning' +
      '._existingPlans, offlineReplanning._discoveredActions, and next', function() {
      const generator = offlineReplanning.replan('existingPlans', 'discoveredActions', 'algorithm');

      generator.next();
      generator.next(next);

      expect(offlineReplanning.emitAsync.args[0]).to.deep.equal([
        'countActions.calculate',
        'existingPlans',
        'discoveredActions',
        'algorithm',
        next,
      ]);
    });

    describe('while offlineReplanning._satisfiedActions.size is less than offlineReplanning._actionOccurrences ' +
      '.size', function() {
      it('should set offlineReplanning._savedPlans to an empty array', function() {
        offlineReplanning._satisfiedActions = new Set();
        offlineReplanning._plans = ['aPlan'];
        const generator = offlineReplanning.replan('existingPlans', 'discoveredActions', 'algorithm');

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});

        expect(offlineReplanning._savedPlans).to.deep.equal([]);
      });

      it('should call offlineReplanning.emitAsync with the event "startNodes.get and next', function() {
        offlineReplanning._satisfiedActions = new Set();
        offlineReplanning._plans = ['aPlan'];
        const generator = offlineReplanning.replan('existingPlans', 'discoveredActions', 'algorithm');

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});

        expect(offlineReplanning.emitAsync.args[1]).to.deep.equal([
          'startNodes.get',
          next,
        ]);
      });

      describe('while the plan.path.length is less than the options.testLength and offlineReplanning.' +
          '_satisfiedActions. size is less than offlineReplanning._actionOccurrences.size', function() {
        it('should call offlineReplanning._getAction once with the first plan in startNodes', function() {
          const startNodes = [{path: ['MY_ACTION'], state: {}}, {path: ['MY_ACTION_2'], state: {}}];
          offlineReplanning._satisfiedActions = new Set();
          offlineReplanning._plans = ['aPlan'];
          offlineReplanning._getAction.returns(null);
          const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
              'algorithm', {testLength: 4});

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
          generator.next(startNodes);

          expect(offlineReplanning._getAction.args).to.deep.equal([
            [
              {
                state: {},
                path: ['MY_ACTION'],
              },
            ],
          ]);
        });

        describe('if the returned action from offlineReplanning._getAction is null', function() {
          it('should not push the action on to plan.path', function() {
            const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns(null);
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);

            expect(startNodes[0].path).to.deep.equal(['MY_ACTION']);
          });
        });

        describe('if the returned action from offlineReplanning._getAction is not null', function() {
          it('should push the action on to plan.path', function() {
            const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns('NEXT_ACTION');
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);

            expect(startNodes[0].path).to.deep.equal(['MY_ACTION', 'NEXT_ACTION']);
          });

          it('should call offlineReplanning.emitAsync with the event "planner.applyEffects", the plan, ' +
                'next', function() {
            const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns('NEXT_ACTION');
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);

            expect(offlineReplanning.emitAsync.args[2]).to.deep.equal([
              'planner.applyEffects',
              {
                path: ['MY_ACTION', 'NEXT_ACTION'],
              },
              next,
            ]);
          });

          it('should call offlineReplanning.emitAsync with the event "possibleActions.get, ' +
                'plan, and next', function() {
            const startNodes = [{path: ['MY_ACTION'], state: {myProperty: {}}},
              {path: ['MY_ACTION_2'], state: {myProperty: {}}}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns('NEXT_ACTION');
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);
            generator.next();

            expect(offlineReplanning.emitAsync.args[3]).to.deep.equal([
              'possibleActions.get',
              {
                myProperty: {},
              },
              next,
            ]);
          });

          it('should set plan.actions to the value returned from emitting the event ' +
                '"possibleActions.get"', function() {
            const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns('NEXT_ACTION');
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);
            generator.next();
            generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});

            expect(startNodes[0].actions).to.deep.equal(['MY_ACTION_3', 'MY_ACTION_4']);
          });

          it('should call offlineReplanning.emitAsync with the event ' +
                '"offlineReplanning.checkForLoopAndBackTrack" ' +
                'checkForLoopAndBackTrack the plan, and next', function() {
            const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
            offlineReplanning._satisfiedActions = new Set();
            offlineReplanning._plans = ['aPlan'];
            offlineReplanning._getAction.returns('NEXT_ACTION');
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 4});

            generator.next();
            generator.next(next);
            generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
            generator.next(startNodes);
            generator.next();
            generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});

            expect(offlineReplanning.emitAsync.args[4]).to.deep.equal([
              'offlineReplanning.checkForLoopAndBackTrack',
              {
                actions: ['MY_ACTION_3', 'MY_ACTION_4'],
                path: ['MY_ACTION', 'NEXT_ACTION'],
              },
              next,
            ]);
          });

          describe('if backtrackPlan is null and offlineReplanning._satisfiedActions does not have the ' +
                'applied action', function() {
            it('should add the action to offlineReplanning_satisfiedActions', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set();
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);

              expect(offlineReplanning._satisfiedActions).to.deep.equal(new Set(['NEXT_ACTION']));
            });

            it('should call offlineReplanning.emitAsync with the event "offlineReplanning.' +
                    'updateExistingPlansAndActionOccurrences" and next', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set();
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);

              expect(offlineReplanning.emitAsync.args[5]).to.deep.equal([
                'offlineReplanning.updateExistingPlansAndActionOccurrences',
                next,
              ]);
            });
          });

          describe('if the returned backtrackPlan is not equal to null', function() {
            it('should set the plan to the returned backtrackPlan', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set();
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next({
                path: [],
              });

              expect(offlineReplanning._getAction.args[1]).to.deep.equal([
                {
                  path: ['NEXT_ACTION'],
                },
              ]);
            });
          });

          describe('if the returned backtrackPlan is null and offlineReplanning._satisfiedActions does ' +
                'not have the action', function() {
            it('should add the action to' +
            'offlineReplanning._satisfiedActions', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set(['SATISFIED_ACTION']);
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({
                actionOccurrences: new Map([
                  ['MY_ACTION', 1],
                  ['MY_ACTION_2', 3],
                  ['NEXT_ACTION', 1],
                ]),
              });
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);

              expect(offlineReplanning._satisfiedActions).to.eql(new Set(['SATISFIED_ACTION', 'NEXT_ACTION']));
            });

            it('should call offlineReplanning.emitAsync next with the event' +
            '"offlineReplanning.updateExistingPlansAndActionOccurrences"', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set(['SATISFIED_ACTION']);
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({
                actionOccurrences: new Map([
                  ['MY_ACTION', 1],
                  ['MY_ACTION_2', 3],
                  ['NEXT_ACTION', 1],
                ]),
              });
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);

              expect(offlineReplanning.emitAsync.args[5][0]).to.equal(
                  'offlineReplanning.updateExistingPlansAndActionOccurrences',
              );
            });
          });

          describe('when backtrackPlan is null and offlineReplanning._satisfiedActions has' +
          ' the action', function() {
            it('should call offlineReplanning._comparePlan with the current plan', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});

              generator.next();
              generator.next(next);
              generator.next({
                actionOccurrences: new Map([
                  ['MY_ACTION', 1],
                  ['MY_ACTION_2', 3],
                  ['NEXT_ACTION', 1],
                ]),
              });
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);

              expect(offlineReplanning._comparePlan.args).to.eql([
                [{
                  actions: [
                    'MY_ACTION_3',
                    'MY_ACTION_4',
                  ],
                  path: [
                    'MY_ACTION',
                    'NEXT_ACTION',
                    'NEXT_ACTION',
                  ],
                }],
              ]);
            });

            describe('while a duplicate is found', function() {
              it('should call offlineReplanning.emitAsync with the event "offlineReplanning.' +
              '_backtrack" and the index of the last good plan', function() {
                const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
                offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
                offlineReplanning._plans = ['aPlan'];
                offlineReplanning._getAction.returns('NEXT_ACTION');
                offlineReplanning._comparePlan.onCall(0).returns(true);
                const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                    'algorithm', {testLength: 4});

                generator.next();
                generator.next(next);
                generator.next({
                  actionOccurrences: new Map([
                    ['MY_ACTION', 1],
                    ['MY_ACTION_2', 3],
                    ['NEXT_ACTION', 1],
                  ]),
                });
                generator.next(startNodes);
                generator.next();
                generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                generator.next(null);

                expect(offlineReplanning.emitAsync.args[5][0]).to.equal(
                    'offlineReplanning.backtrack',
                );
              });

              describe('when backtrackPlan is not null', function() {
                it('should call configHandler.get with the string "debug"', function() {
                  const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
                  offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
                  offlineReplanning._plans = ['aPlan'];
                  offlineReplanning._getAction.returns('NEXT_ACTION');
                  offlineReplanning._comparePlan.onCall(0).returns(true);
                  const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                      'algorithm', {testLength: 4});

                  generator.next();
                  generator.next(next);
                  generator.next({
                    actionOccurrences: new Map([
                      ['MY_ACTION', 1],
                      ['MY_ACTION_2', 3],
                      ['NEXT_ACTION', 1],
                    ]),
                  });
                  generator.next(startNodes);
                  generator.next();
                  generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                  generator.next(null);
                  generator.next({
                    backtrackPlan: {
                      path: [],
                    },
                    newSavedPlans: 'newSavedPlans',
                    removed: 'removed'});

                  expect(configHandler.get.args[0]).to.deep.equal([
                    'debug',
                  ]);
                });

                describe('when configHandler.get returns true', function() {
                  it('should call console.log with a message about backtracking', function() {
                    const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
                    offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
                    offlineReplanning._plans = ['aPlan'];
                    offlineReplanning._getAction.returns('NEXT_ACTION');
                    offlineReplanning._comparePlan.onCall(0).returns(true);
                    const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                        'algorithm', {testLength: 4});
                    configHandler.get.returns(true);

                    generator.next();
                    generator.next(next);
                    generator.next({
                      actionOccurrences: new Map([
                        ['MY_ACTION', 1],
                        ['MY_ACTION_2', 3],
                        ['NEXT_ACTION', 1],
                      ]),
                    });
                    generator.next(startNodes);
                    generator.next();
                    generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                    generator.next(null);
                    generator.next({
                      backtrackPlan: {
                        path: [],
                        lastAction: 'lastAction',
                      },
                      newSavedPlans: 'newSavedPlans',
                      removed: 'removed'});

                    expect(console.log.args[1]).to.deep.equal([
                      'Backtracked to: lastAction',
                    ]);
                  });
                });

                describe('for each removed action', function() {
                  describe('when newlySatisfiedActions has the action being removed', function() {
                    it('should remove the action from' +
                    'offlineReplanning._satisfiedActions ', function() {
                      const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
                      offlineReplanning._satisfiedActions = new Set([]);
                      offlineReplanning._plans = ['aPlan'];
                      offlineReplanning._getAction.returns('MY_ACTION');
                      offlineReplanning._comparePlan.onCall(0).returns(true);
                      const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                          'algorithm', {testLength: 4});
                      configHandler.get.returns(true);

                      generator.next();
                      generator.next(next);
                      generator.next({
                        actionOccurrences: new Map([
                          ['MY_ACTION', 1],
                          ['MY_ACTION_2', 3],
                          ['NEXT_ACTION', 1],
                        ]),
                      });
                      generator.next(startNodes);
                      generator.next();
                      generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                      generator.next(null);
                      generator.next();
                      generator.next();
                      generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                      generator.next(null);
                      generator.next({
                        backtrackPlan: {
                          path: [],
                          lastAction: 'lastAction',
                        },
                        newSavedPlans: 'newSavedPlans',
                        removed: [
                          'MY_ACTION',
                        ]});

                      expect(offlineReplanning._satisfiedActions).to.deep.equal(new Set([]));
                    });
                  });
                });
              });
            });

            describe('when backtrackPlan is null', function() {
              it('should throw an error', function() {
                const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
                offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
                offlineReplanning._plans = ['aPlan'];
                offlineReplanning._getAction.returns('NEXT_ACTION');
                offlineReplanning._comparePlan.onCall(0).returns(true);

                try {
                  const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                      'algorithm', {testLength: 4});
                  configHandler.get.returns(true);

                  generator.next();
                  generator.next(next);
                  generator.next({
                    actionOccurrences: new Map([
                      ['MY_ACTION', 1],
                      ['MY_ACTION_2', 3],
                      ['NEXT_ACTION', 1],
                    ]),
                  });
                  generator.next(startNodes);
                  generator.next();
                  generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
                  generator.next(null);
                  generator.next({
                    backtrackPlan: null,
                    newSavedPlans: 'newSavedPlans',
                    removed: 'removed'});

                  fail();
                } catch (e) {
                  expect(e).to.be.an('Error');
                }
              });
            });

            it('should call offlineReplanning._comparePlan with the new backtrackPlan', function() {
              const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
              offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
              offlineReplanning._plans = ['aPlan'];
              offlineReplanning._getAction.returns('NEXT_ACTION');
              offlineReplanning._comparePlan.onCall(0).returns(true);
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 4});
              configHandler.get.returns(true);

              generator.next();
              generator.next(next);
              generator.next({
                actionOccurrences: new Map([
                  ['MY_ACTION', 1],
                  ['MY_ACTION_2', 3],
                  ['NEXT_ACTION', 1],
                ]),
              });
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);
              generator.next({
                backtrackPlan: {
                  path: 'NEW_PLAN',
                },
                newSavedPlans: 'newSavedPlans',
                removed: 'removed'});

              expect(offlineReplanning._comparePlan.args[1]).to.eql([
                {path: 'NEW_PLAN'},
              ]);
            });
          });
        });
      });

      describe('when the plan path length is zero', function() {
        it('should not save a plan', function() {
          const startNodes = [{path: []}];
          offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
          offlineReplanning._plans = ['aPlan'];
          const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
              'algorithm', {testLength: 0});
          configHandler.get.returns(true);

          generator.next();
          generator.next(next);
          generator.next({
            actionOccurrences: new Map([
              ['MY_ACTION', 1],
              ['MY_ACTION_2', 3],
              ['NEXT_ACTION', 1],
            ]),
          });
          generator.next(startNodes);

          expect(offlineReplanning._savePlan.args).to.eql([]);
        });

        it('should not retry planning', function() {
          const startNodes = [{path: []}];
          offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
          offlineReplanning._plans = ['aPlan'];
          const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
              'algorithm', {testLength: 0});
          configHandler.get.returns(true);

          generator.next();
          generator.next(next);
          generator.next({
            actionOccurrences: new Map([
              ['MY_ACTION', 1],
              ['MY_ACTION_2', 3],
              ['NEXT_ACTION', 1],
            ]),
          });
          generator.next(startNodes);

          // Tests that 'retrying' is not logged
          expect(console.log.args).to.eql([
            [
              '\nBeginning offline replanning\n',
            ],
          ]);
        });
      });

      describe('when the newlySatisfiedActions size is zero', function() {
        it('should call configHandler.get with the string "debug"', function() {
          const startNodes = [{path: ['NEXT_ACTION']}];
          offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
          offlineReplanning._getAction.returns('NEXT_ACTION');
          offlineReplanning._plans = ['aPlan'];
          try {
            const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                'algorithm', {testLength: 2});
            configHandler.get.returns(true);

            generator.next();
            generator.next(next);
            generator.next({
              actionOccurrences: new Map([
                ['MY_ACTION', 1],
                ['MY_ACTION_2', 3],
                ['NEXT_ACTION', 1],
              ]),
            });
            generator.next(startNodes);
            generator.next();
            generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
            generator.next(null);
            generator.next(startNodes);
          } finally {
            expect(configHandler.get.args[3]).to.deep.equal([
              'debug',
            ]);
          }
        });

        describe('if configHandler.get returns a truthy value', function() {
          it('should call console.log once with a message about beginning planning', function() {
            const startNodes = [{path: ['NEXT_ACTION']}];
            offlineReplanning._satisfiedActions = new Set(['NEXT_ACTION']);
            offlineReplanning._getAction.returns('NEXT_ACTION');
            offlineReplanning._plans = ['aPlan'];
            try {
              const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
                  'algorithm', {testLength: 2});
              configHandler.get.returns(true);

              generator.next();
              generator.next(next);
              generator.next({
                actionOccurrences: new Map([
                  ['MY_ACTION', 1],
                  ['MY_ACTION_2', 3],
                  ['NEXT_ACTION', 1],
                ]),
              });
              generator.next(startNodes);
              generator.next();
              generator.next({applicableActions: ['MY_ACTION_3', 'MY_ACTION_4']});
              generator.next(null);
              generator.next(startNodes);
            } finally {
              expect(console.log.args[2]).to.deep.equal([
                'Retrying replanning for plan 1',
              ]);
            }
          });
        });
      });

      describe('when the plan path length is good', function() {
        it('should call configHandler.get with the startNode plan', function() {
          const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
          offlineReplanning._satisfiedActions = new Set();
          offlineReplanning._plans = ['aPlan'];
          offlineReplanning._getAction.returns(null);
          const generator =
            offlineReplanning.replan('existingPlans', 'discoveredActions', 'algorithm', {testLength: 1});

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
          generator.next(startNodes);

          expect(offlineReplanning._savePlan.args).to.deep.equal([
            [
              {
                path: ['MY_ACTION'],
              },
            ],
          ]);
        });

        it('should call offlineReplanning._savePlan with the startNode plan', function() {
          const startNodes = [{path: ['MY_ACTION']}, {path: ['MY_ACTION_2']}];
          offlineReplanning._satisfiedActions = new Set();
          offlineReplanning._plans = ['aPlan'];
          offlineReplanning._getAction.returns(null);
          const generator =
            offlineReplanning.replan('existingPlans', 'discoveredActions', 'algorithm', {testLength: 1});

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});
          generator.next(startNodes);

          expect(offlineReplanning._savePlan.args).to.deep.equal([
            [
              {
                path: ['MY_ACTION'],
              },
            ],
          ]);
        });
      });
    });

    describe('if offlineReplanning._satisfiedActions.size is equal to offlineReplanning._actionOccurrences ' +
      '.size', function() {
      describe('if offlineReplanning._algorithm is actiontree', function() {
        it('should call offlineReplanning.emitAsync with the event "planningFinished", offlineReplanning._plans, ' +
        'offlineReplanning._discoveredActions, offlineReplanning._algorithm', function() {
          offlineReplanning._satisfiedActions = new Set(['MY_ACTION']);
          offlineReplanning._plans = ['aPlan'];
          const generator = offlineReplanning.replan('existingPlans', 'discoveredActions', 'actionTree');

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});

          expect(offlineReplanning.emitAsync.args[1]).to.deep.equal([
            'planner.planningFinished',
            [undefined],
            'discoveredActions',
            'actionTree',
          ]);
        });
      });

      describe('if offlineReplanning._algorithm is forwardstatespacesearchheuristic', function() {
        it('should call offlineReplanning.emitAsync with the event "planningFinished", offlineReplanning._plans, ' +
        'offlineReplanning._discoveredActions, offlineReplanning._algorithm', function() {
          offlineReplanning._satisfiedActions = new Set(['MY_ACTION']);
          offlineReplanning._plans = ['aPlan'];
          const generator = offlineReplanning.replan('existingPlans', 'discoveredActions',
              'forwardStateSpaceSearchHeuristic');

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences: new Map([['MY_ACTION', 1]])});

          expect(offlineReplanning.emitAsync.args[1]).to.deep.equal([
            'planner.planningFinished',
            ['aPlan'],
            'discoveredActions',
            'forwardStateSpaceSearchHeuristic',
          ]);
        });
      });
    });
  });

  describe('_checkForLoopAndBackTrack', function() {
    let Emitter;
    let plannerEventDispatch;
    let configHandler;
    let callback;
    let next;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      configHandler = {
        get: sinon.stub(),
      };
      sinon.spy(console, 'log');
      callback = sinon.stub();
      next = sinon.stub();
      global.SimulatoError = {
        PLANNER: {
          FAILED_TO_BACKTRACK: sinon.stub(),
        },
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      offlineReplanning._savedPlans = [];
      offlineReplanning._detectLoop = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call offlineReplanning._detectLoop once with the passed in plan', function() {
      const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

      generator.next();
      generator.next(next);

      expect(offlineReplanning._detectLoop.args).to.deep.equal([
        ['myPlan'],
      ]);
    });

    describe('if the loopStartIndex is not equal to the number "-1"', function() {
      it('should call offlineReplanning.emitAsync once with the event "offlineReplanning.backtrack",' +
        'the passed in plan, and next', function() {
        offlineReplanning._detectLoop.returns(3);
        const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

        generator.next();
        generator.next(next);

        expect(offlineReplanning.emitAsync.args).to.deep.equal([
          [
            'offlineReplanning.backtrack',
            3,
            next,
          ],
        ]);
      });

      describe('if the backtrackPlan is not null', function() {
        it('should set offlineReplanning._savedPlans to the returned newSavedPlans', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: 'myBackTrackPlan',
            newSavedPlans: ['planOne', 'planTwo'],
          });

          expect(offlineReplanning._savedPlans).to.deep.equal(['planOne', 'planTwo']);
        });

        it('should call configHandler.get once with "debug" as the parameter', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: 'myBackTrackPlan',
            newSavedPlans: [],
          });

          expect(configHandler.get.args).to.deep.equal([
            [
              'debug',
            ],
          ]);
        });

        it('should call the callback with once with null and the backtrackPlan', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: 'myBackTrackPlan',
            newSavedPlans: [],
          });

          expect(callback.args).to.deep.equal([
            [
              null,
              'myBackTrackPlan',
            ],
          ]);
        });

        describe('if configHandler.get returns truthy', function() {
          it('should call console.log once with the string "Backtracked to: " concatenated with ' +
            'backtrackPlan.lastAction', function() {
            offlineReplanning._detectLoop.returns(3);
            configHandler.get.returns(true);
            const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

            generator.next();
            generator.next(next);
            generator.next({
              backtrackPlan: {
                lastAction: 'myComponent.ACTION',
              },
              newSavedPlans: [],
            });

            expect(console.log.args).to.deep.equal([
              [
                'Backtracked to: myComponent.ACTION',
              ],
            ]);
          });
        });

        describe('if configHandler.get returns a falsy value', function() {
          it('should not call console.log', function() {
            offlineReplanning._detectLoop.returns(3);
            const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

            generator.next();
            generator.next(next);
            generator.next({
              backtrackPlan: {
                lastAction: 'myComponent.ACTION',
              },
              newSavedPlans: [],
            });

            expect(console.log.callCount).to.equal(0);
          });
        });
      });

      describe('if the backtrackPlan is null', function() {
        it('should call SimulatoError.PLANNER.FAILED_TO_BACKTRACK once with an error message', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: null,
            newSavedPlans: null,
          });

          expect(SimulatoError.PLANNER.FAILED_TO_BACKTRACK.args).to.deep.equal([
            [
              'Unable to backtrack. No suitable backtrack point found',
            ],
          ]);
        });

        it('should call SimulatoError.PLANNER.FAILED_TO_BACKTRACK once with the keyword "new"', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: null,
            newSavedPlans: null,
          });

          expect(SimulatoError.PLANNER.FAILED_TO_BACKTRACK.calledWithNew()).to.equal(true);
        });


        it('should call the callback once with the planner error', function() {
          offlineReplanning._detectLoop.returns(3);
          const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);
          SimulatoError.PLANNER.FAILED_TO_BACKTRACK.returns(
              {
                message: 'Failed to backtrack error',
              },
          );

          generator.next();
          generator.next(next);
          generator.next({
            backtrackPlan: null,
            newSavedPlans: null,
          });

          expect(callback.args).to.deep.equal([
            [
              {
                message: 'Failed to backtrack error',
              },
            ],
          ]);
        });
      });
    });

    describe('if the loopStartIndex is equal to the number "-1"', function() {
      it('should call offlineReplanning.emitAsync once with the event "searchNode.clone",' +
        'the passed in plan, and next', function() {
        offlineReplanning._detectLoop.returns(-1);
        const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

        generator.next();
        generator.next(next);
        generator.next();

        expect(offlineReplanning.emitAsync.args).to.deep.equal([
          [
            'searchNode.clone',
            'myPlan',
            next,
          ],
        ]);
      });

      it('should push the copied plan on to the offlineReplanning._savedPlans array', function() {
        offlineReplanning._detectLoop.returns(-1);
        const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

        generator.next();
        generator.next(next);
        generator.next('copiedPlan');

        expect(offlineReplanning._savedPlans).to.deep.equal(['copiedPlan']);
      });

      it('should call the passed in callback once with null and null as parameters', function() {
        offlineReplanning._detectLoop.returns(-1);
        const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

        generator.next();
        generator.next(next);
        generator.next();

        expect(callback.args).to.deep.equal([
          [
            null,
            null,
          ],
        ]);
      });

      it('should return the result of the callback function', function() {
        callback.returns('myReturnValue');
        offlineReplanning._detectLoop.returns(-1);
        const generator = offlineReplanning._checkForLoopAndBackTrack('myPlan', callback);

        generator.next();
        generator.next(next);
        const result = generator.next();

        expect(result).to.deep.equal(
            {
              value: 'myReturnValue',
              done: true,
            },
        );
      });
    });
  });

  describe('_updateExistingPlansAndActionOccurrences', function() {
    let Emitter;
    let plannerEventDispatch;
    let callback;
    let next;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      callback = sinon.stub();
      next = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      offlineReplanning._existingPlans = [];
      offlineReplanning._pruneExistingPlans = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call offlineReplanning._pruneExistingPlans once with no arguments', function() {
      offlineReplanning._pruneExistingPlans.returns([]);
      const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

      generator.next();
      generator.next(next);

      expect(offlineReplanning._pruneExistingPlans.args).to.deep.equal([[]]);
    });

    describe('if prunedPlans.length is not equal to offlineReplanning._existingPlans.length', function() {
      it('should set offlineReplanning._existingPlans to the prunedPlans', function() {
        offlineReplanning._pruneExistingPlans.returns(['planOne']);
        const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

        generator.next();
        generator.next(next);

        expect(offlineReplanning._existingPlans).to.deep.equal(['planOne']);
      });

      it('should call offlineReplanning.emitAsync once with the event "countActions.calculate", ' +
        'offlineReplanning._existingPlans, offlineReplanning._discoveredActions, and nexts', function() {
        offlineReplanning._pruneExistingPlans.returns(['planOne']);
        offlineReplanning._discoveredActions = new Set('ACTION_ONE');
        offlineReplanning._algorithm = 'algorithm';
        const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

        generator.next();
        generator.next(next);

        expect(offlineReplanning.emitAsync.args).to.deep.equal([
          [
            'countActions.calculate',
            ['planOne'],
            new Set('ACTION_ONE'),
            'algorithm',
            next,
          ],
        ]);
      });

      it('should set offlineReplanning._actionOccurrences equal to the actionOccurence from ' +
        'emitting the event "countActions.calculate"', function() {
        offlineReplanning._pruneExistingPlans.returns(['planOne']);
        const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: 'myActionOccurrences'});

        expect(offlineReplanning._actionOccurrences).to.equal('myActionOccurrences');
      });
    });

    describe('if prunedPlans.length is equal to offlineReplanning._existingPlans.length', function() {
      it('should not call offlineReplanning.emitAsync', function() {
        offlineReplanning._pruneExistingPlans.returns([]);
        const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

        generator.next();
        generator.next(next);

        expect(offlineReplanning.emitAsync.callCount).to.equal(0);
      });
    });

    it('should call the callback once with no parameters', function() {
      offlineReplanning._pruneExistingPlans.returns([]);
      const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

      generator.next();
      generator.next(next);

      expect(callback.args).to.deep.equal([[]]);
    });

    it('should return the result of the callback', function() {
      callback.returns('myReturnValue');
      offlineReplanning._pruneExistingPlans.returns([]);
      const generator = offlineReplanning._updateExistingPlansAndActionOccurrences(callback);

      generator.next();
      const result = generator.next(next);

      expect(result).to.deep.equal({
        value: 'myReturnValue',
        done: true,
      });
    });
  });

  describe('_savePlan', function() {
    let Emitter;
    let plannerEventDispatch;
    let configHandler;
    let offlineReplanning;
    let crypto;
    let hash;
    let update;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      configHandler = {
        get: sinon.stub(),
      };
      global.SimulatoError = {
        PLANNER: {
          DUPLICATE_PLAN_GENERATED: sinon.stub(),
        },
      };
      sinon.spy(console, 'log');

      update = {
        digest: sinon.stub(),
      };
      hash = {
        update: sinon.stub().returns(update),
      };
      crypto = {
        createHash: sinon.stub().returns(hash),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('crypto', crypto);

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
      offlineReplanning._isDuplicate = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call offlineReplanning._isDuplicate once with the passed in plan', function() {
      offlineReplanning._savePlan('myPlan');

      expect(offlineReplanning._isDuplicate.args).to.deep.equal([
        [
          'myPlan',
        ],
      ]);
    });

    describe('if duplicate is truthy', function() {
      it('should throw an error', function() {
        offlineReplanning._isDuplicate.returns(true);

        expect(offlineReplanning._savePlan.bind(null, 'myPlan')).to.throw();
      });

      it('should call call SimulatoError.PLANNER.DUPLICATE_PLAN_GENERATED once ' +
        'with an error message', function() {
        offlineReplanning._isDuplicate.returns(true);

        try {
          offlineReplanning._savePlan('myPlan');
        } catch (error) { }

        expect(SimulatoError.PLANNER.DUPLICATE_PLAN_GENERATED.args).to.deep.equal([
          [
            'A duplicate plan was detected. This should never happen in offline replanning',
          ],
        ]);
      });
    });

    describe('if duplicate is falsy', function() {
      it('should call createHash with "sha256"', function() {
        offlineReplanning._savePlan({path: 'myPath'});

        expect(crypto.createHash.args).to.eql([
          ['sha256'],
        ]);
      });

      it('should update the hash with the plan path', function() {
        offlineReplanning._savePlan({path: 'myPath'});

        expect(hash.update.args).to.eql([
          ['\"myPath\"'],
        ]);
      });

      it('should create a base64 digest of the hash', function() {
        offlineReplanning._savePlan({path: 'myPath'});

        expect(update.digest.args).to.eql([
          ['base64'],
        ]);
      });

      it('should add push the passed in plan on to offlinePlanning._plans', function() {
        offlineReplanning._savePlan('myPlan');

        expect(offlineReplanning._plans).to.deep.equal(['myPlan']);
      });

      it('should call configHandler.get once with the string "debug"', function() {
        offlineReplanning._savePlan('myPlan');

        expect(configHandler.get.args).to.deep.equal([
          [
            'debug',
          ],
        ]);
      });

      describe('if configHandler.get returns a truthy value', function() {
        it('should call console.log with the string "Actions covered: " and ' +
          'the _satisfiedActions size over the _discoveredActions', function() {
          configHandler.get.returns(true);
          offlineReplanning._discoveredActions = new Set([
            'ACTION_ONE',
            'ACTION_TWO',
          ]);
          offlineReplanning._satisfiedActions = new Set([
            'ACTION_ONE',
          ]);
          offlineReplanning._savePlan('myPlan');

          expect(console.log.args).to.deep.equal([
            [
              'Actions covered: 1 / 2',
            ],
          ]);
        });
      });

      describe('if configHandler.get returns a falsy value', function() {
        it('should not call console.log', function() {
          offlineReplanning._savePlan('myPlan');

          expect(console.log.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_getAction', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      global.SimulatoError = {
        PLANNER: {
          NO_STARTING_ACTIONS: sinon.stub(),
        },
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      offlineReplanning._chooseAction = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if plan.actions has plan.lastAction', function() {
      it('should delete the plan from plan.actions', function() {
        const plan = {
          actions: new Set(['ACTION_ONE']),
          lastAction: 'ACTION_ONE',
          path: ['ACTION_ONE'],
        };

        offlineReplanning._getAction(plan);

        expect(plan.actions).to.deep.equal(new Set());
      });
    });

    describe('if plan.actions does not have plan.lastAction', function() {
      it('should not delete the plan from plan.actions', function() {
        const plan = {
          actions: new Set(['ACTION_ONE']),
          lastAction: 'ACTION_TWO',
          path: ['ACTION_ONE', 'ACTION_TWO'],
        };

        offlineReplanning._getAction(plan);

        expect(plan.actions).to.deep.equal(new Set(['ACTION_ONE']));
      });
    });

    describe('if plan.actions.size is equal to 0', function() {
      describe('if plan.path.length is greater than 0', function() {
        it('should return null', function() {
          const plan = {
            actions: new Set(),
            lastAction: 'ACTION_ONE',
            path: ['ACTION_ONE'],
          };

          const result = offlineReplanning._getAction(plan);

          expect(result).to.equal(null);
        });
      });

      describe('if plan.path.length is not greater than 0', function() {
        it('should throw an error', function() {
          const plan = {
            actions: new Set(),
            lastAction: '',
            path: [],
          };

          expect(offlineReplanning._getAction.bind(null, plan)).to.throw();
        });

        it('should call SimulatoError.PLANNER.NO_STARTING_ACTIONS once with an error message', function() {
          const plan = {
            actions: new Set(),
            lastAction: '',
            path: [],
          };

          try {
            offlineReplanning._getAction(plan);
          } catch (error) { }

          expect(SimulatoError.PLANNER.NO_STARTING_ACTIONS.args).to.deep.equal([
            [
              'No possible actions in starting state',
            ],
          ]);
        });
      });
    });

    describe('if plan.actions.size is not equal to 0', function() {
      it('should call offlineReplanning._chooseAction once with the passed in plan', function() {
        const plan = {
          actions: new Set(['ACTION_THREE']),
          lastAction: 'ACTION_ONE',
          path: ['ACTION_ONE'],
        };

        offlineReplanning._getAction(plan);

        expect(offlineReplanning._chooseAction.args).to.deep.equal([
          [
            {
              actions: new Set(['ACTION_THREE']),
              lastAction: 'ACTION_ONE',
              path: ['ACTION_ONE'],
            },
          ],
        ]);
      });

      describe('if the action returned from offlineReplanning._choose is null', function() {
        describe('if plan.path.length is greater than 0', function() {
          it('should return null', function() {
            offlineReplanning._chooseAction.returns(null);
            const plan = {
              actions: new Set(['ACTION_THREE']),
              lastAction: '',
              path: ['ACTION_ONE'],
            };

            const result = offlineReplanning._getAction(plan);

            expect(result).to.equal(null);
          });
        });

        describe('if plan.path.length is not greater than 0', function() {
          it('should call SimulatoError.PLANNER.NO_STARTING_ACTIONS once with an error message', function() {
            const plan = {
              actions: new Set(['ACTION_THREE']),
              lastAction: '',
              path: [],
            };
            offlineReplanning._chooseAction.returns(null);
            offlineReplanning._getAction(plan);

            expect(SimulatoError.PLANNER.NO_STARTING_ACTIONS.args).to.deep.equal([
              [
                'No possible actions in starting state',
              ],
            ]);
          });
        });

        it('should return null', function() {
          offlineReplanning._chooseAction.returns(null);
          const plan = {
            actions: new Set(['ACTION_THREE']),
            lastAction: '',
            path: [],
          };

          const result = offlineReplanning._getAction(plan);

          expect(result).to.equal(null);
        });
      });

      describe('if the action returned from offlineReplanning._choose is not null', function() {
        it('should return the action', function() {
          offlineReplanning._chooseAction.returns('chosenAction');
          const plan = {
            actions: new Set(['ACTION_THREE']),
            lastAction: 'ACTION_ONE',
            path: ['ACTION_ONE'],
          };

          const result = offlineReplanning._getAction(plan);

          expect(result).to.deep.equal('chosenAction');
        });
      });
    });
  });

  describe('_pruneExistingPlans', function() {
    let Emitter;
    let plannerEventDispatch;
    let setOperations;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      setOperations = {
        isSuperset: sinon.stub(),
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', setOperations);
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each plan in offlineReplanning._existingPlans', function() {
      describe('if offlineReplanning._algorithm is actiontree', function() {
        it('should call setOperations.isSuperset once with offlineReplanning._satisfiedActions ' +
        'and plan as a set', function() {
          offlineReplanning._algorithm = 'actionTree';
          offlineReplanning._existingPlans = [['entrypoint', {name: 'ACTION_ONE'}]];
          offlineReplanning._satisfiedActions = new Set(['ACTION_ONE']);

          offlineReplanning._pruneExistingPlans();

          expect(setOperations.isSuperset.args).to.deep.equal([
            [
              new Set(['ACTION_ONE']),
              new Set(['ACTION_ONE']),
            ],
          ]);
        });
      });

      describe('if offlineReplanning._algorithm is forwardstatespacesearchheuristic', function() {
        it('should call setOperations.isSuperset once with offlineReplanning._satisfiedActions ' +
        'and plan.path as a set', function() {
          offlineReplanning._algorithm = 'forwardStateSpaceSearchHeuristic';
          offlineReplanning._existingPlans = [{path: ['ACTION_ONE']}];
          offlineReplanning._satisfiedActions = new Set(['ACTION_ONE']);

          offlineReplanning._pruneExistingPlans();

          expect(setOperations.isSuperset.args).to.deep.equal([
            [
              new Set(['ACTION_ONE']),
              new Set(['ACTION_ONE']),
            ],
          ]);
        });
      });

      describe('if setOperations.isSuperset returns a truthy value', function() {
        it('should not add the plan to the prunedPlans', function() {
          setOperations.isSuperset.returns(true);
          offlineReplanning._algorithm = 'forwardStateSpaceSearchHeuristic';
          offlineReplanning._existingPlans = [{path: ['ACTION_ONE']}];
          offlineReplanning._satisfiedActions = new Set(['ACTION_ONE']);

          const result = offlineReplanning._pruneExistingPlans();

          expect(result).to.deep.equal([]);
        });
      });

      describe('if setOperations.isSuperset returns a falsy value', function() {
        it('should add the the plan to the prunedPlans', function() {
          setOperations.isSuperset.returns(false);
          offlineReplanning._algorithm = 'forwardStateSpaceSearchHeuristic';
          offlineReplanning._existingPlans = [{path: ['ACTION_ONE']}];
          offlineReplanning._satisfiedActions = new Set(['ACTION_ONE']);

          const result = offlineReplanning._pruneExistingPlans();

          expect(result).to.deep.equal([{path: ['ACTION_ONE']}]);
        });
      });
    });

    describe('if there are two plans in offlineReplanning._existingPlans', function() {
      it('should call superOperations.isSuperset twice', function() {
        offlineReplanning._algorithm = 'forwardStateSpaceSearchHeuristic';
        offlineReplanning._existingPlans = [{path: ['ACTION_ONE']}, {path: ['ACTION_TWO']}];
        offlineReplanning._satisfiedActions = new Set(['ACTION_ONE', 'ACTION_TWO']);

        offlineReplanning._pruneExistingPlans();

        expect(setOperations.isSuperset.callCount).to.deep.equal(2);
      });

      describe('if setOperations.isSuperset returns true for the first plan and false for the second plan', function() {
        it('should only the second plan to the prunedPlans array', function() {
          setOperations.isSuperset.onCall(0).returns(true);
          setOperations.isSuperset.onCall(1).returns(false);
          offlineReplanning._algorithm = 'forwardStateSpaceSearchHeuristic';
          offlineReplanning._existingPlans = [{path: ['ACTION_ONE']}, {path: ['ACTION_TWO']}];
          offlineReplanning._satisfiedActions = new Set(['ACTION_ONE', 'ACTION_TWO']);

          const result = offlineReplanning._pruneExistingPlans();

          expect(result).to.deep.equal([{path: ['ACTION_TWO']}]);
        });
      });
    });
  });

  describe('_isDuplicate', function() {
    let Emitter;
    let plannerEventDispatch;
    let setOperations;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      setOperations = {
        isEqual: sinon.stub(),
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', setOperations);
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each plan in offlineReplanning._plans', function() {
      it('should call setOperations.isEqual once with aPlan.paht and the passed in plan.path as a set', function() {
        offlineReplanning._plans = [{path: ['ACTION_ONE']}];
        const plan = {path: ['ACTION_TWO']};

        offlineReplanning._isDuplicate(plan);

        expect(setOperations.isEqual.args).to.deep.equal([
          [
            new Set(['ACTION_ONE']),
            new Set(['ACTION_TWO']),
          ],
        ]);
      });

      it('should return true if setOperations.isEqual returns a truthy value', function() {
        setOperations.isEqual.returns(true);
        offlineReplanning._plans = [{path: ['ACTION_ONE']}];
        const plan = {path: ['ACTION_ONE']};

        const result = offlineReplanning._isDuplicate(plan);

        expect(result).to.equal(true);
      });

      it('should return false if setOperations.isEqual returns a falsy value', function() {
        setOperations.isEqual.returns(false);
        offlineReplanning._plans = [{path: ['ACTION_ONE']}];
        const plan = {path: ['ACTION_ONE']};

        const result = offlineReplanning._isDuplicate(plan);

        expect(result).to.equal(false);
      });
    });

    describe('if there are two plan ins offlineReplanning._plans', function() {
      it('should call setOperations.isEqual twice', function() {
        offlineReplanning._plans = [{path: ['ACTION_ONE']}, {path: ['ACTION_TWO']}];
        const plan = {path: ['ACTION_ONE']};

        offlineReplanning._isDuplicate(plan);

        expect(setOperations.isEqual.callCount).to.equal(2);
      });

      describe('if setOperations.isEqual returns false of the first plan and true for the second plan', function() {
        it('should return true', function() {
          setOperations.isEqual.onCall(0).returns(false);
          setOperations.isEqual.onCall(1).returns(true);
          offlineReplanning._plans = [{path: ['ACTION_TWO']}, {path: ['ACTION_ONE']}];
          const plan = {path: ['ACTION_ONE']};

          const result = offlineReplanning._isDuplicate(plan);

          expect(result).to.equal(true);
        });
      });

      describe('if setOperations.isEqual returns false for both plans', function() {
        it('should return true', function() {
          setOperations.isEqual.returns(false);
          offlineReplanning._plans = [{path: ['ACTION_TWO']}, {path: ['ACTION_THREE']}];
          const plan = {path: ['ACTION_ONE']};

          const result = offlineReplanning._isDuplicate(plan);

          expect(result).to.equal(false);
        });
      });
    });
  });

  describe('_chooseAction', function() {
    let Emitter;
    let plannerEventDispatch;
    let setOperations;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      setOperations = {
        difference: sinon.stub(),
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', setOperations);
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      offlineReplanning._filterZeroActionCountActions = sinon.stub();
      offlineReplanning._getActionWithSameComponent = sinon.stub();
      offlineReplanning._getMostOccurringAction = sinon.stub();
      offlineReplanning._getLeastOccurringActionInPath = sinon.stub();
      offlineReplanning._random = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call offlineReplanning._filterZeroActionCountActions once with the passed in plan.actions', function() {
      const plan = {
        actions: ['ACTION_ONE'],
      };
      offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
      setOperations.difference.returns(new Set());

      offlineReplanning._chooseAction(plan);

      expect(offlineReplanning._filterZeroActionCountActions.args).to.deep.equal([
        [
          ['ACTION_ONE'],
        ],
      ]);
    });

    it('should call setOperations.difference with the nonZeroActionCountActions, and ' +
      'offlineReplanning._satisfiedActions', function() {
      offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
      offlineReplanning._satisfiedActions = new Set(['ACTION_TWO']);
      const plan = {
        actions: ['ACTION_THREE'],
      };
      setOperations.difference.returns(new Set());

      offlineReplanning._chooseAction(plan);

      expect(setOperations.difference.args[0]).to.deep.equal(
          [
            new Set(['ACTION_ONE', 'ACTION_TWO']),
            new Set(['ACTION_TWO']),
          ],
      );
    });

    it('should call offlineReplanning._getActionWithSameComponent once with the passed in plan and ' +
      'unsatisfiedAction', function() {
      const plan = {
        actions: ['ACTION_THREE'],
      };
      offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
      setOperations.difference.returns(new Set(['ACTION_FOUR']));

      offlineReplanning._chooseAction(plan);

      expect(offlineReplanning._getActionWithSameComponent.args).to.deep.equal([
        [
          {
            actions: ['ACTION_THREE'],
          },
          new Set(['ACTION_FOUR']),
        ],
      ]);
    });

    describe('if actionWithSameComponent is truthy', function() {
      it('should call setOperations.difference once', function() {
        const plan = {
          actions: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
        setOperations.difference.returns(new Set());
        offlineReplanning._getActionWithSameComponent.returns('ACTION_WITH_SAME_COMPONENT');

        offlineReplanning._chooseAction(plan);

        expect(setOperations.difference.callCount).to.equal(1);
      });
      it('should return the actionWithSameComponent', function() {
        const plan = {
          actions: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
        setOperations.difference.returns(new Set());
        offlineReplanning._getActionWithSameComponent.returns('ACTION_WITH_SAME_COMPONENT');

        const result = offlineReplanning._chooseAction(plan);

        expect(result).to.equal('ACTION_WITH_SAME_COMPONENT');
      });
    });

    describe('if actionWithSameComponent is falsy and unsatisfiedActions.size is greater than 0', function() {
      it('should call offlineReplanning._random with a min and max value', function() {
        const plan = {
          actions: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
        setOperations.difference.returns(new Set(['ACTION_TWO', 'ACTION_THREE']));

        offlineReplanning._chooseAction(plan);

        expect(offlineReplanning._random.args).to.eql([
          [0, 1],
        ]);
      });

      it('should return the unusedAction at the index returned by offlineReplanning._random', function() {
        const plan = {
          actions: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
        setOperations.difference.returns(new Set(['ACTION_TWO', 'ACTION_THREE']));
        offlineReplanning._random.returns(1);

        const chosen = offlineReplanning._chooseAction(plan);

        expect(chosen).to.eql('ACTION_THREE');
      });
    });

    describe('if actionWithSameComponent is falsy and unsatisfiedActions.size is not greater than 0', function() {
      it('should call setOperations.difference with the nonZeroActionCountActions and the passed in ' +
        'plan.path as a set', function() {
        const plan = {
          actions: ['ACTION_THREE'],
          path: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_FOUR', 'ACTION_FIVE']));
        setOperations.difference.returns(new Set());

        offlineReplanning._chooseAction(plan);

        expect(setOperations.difference.args[1]).to.deep.equal([
          new Set(['ACTION_FOUR', 'ACTION_FIVE']),
          new Set(['ACTION_ONE']),
        ]);
      });

      it('should call setOperations.differnce twice', function() {
        const plan = {
          actions: ['ACTION_ONE'],
        };
        offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
        setOperations.difference.returns(new Set());

        offlineReplanning._chooseAction(plan);

        expect(setOperations.difference.callCount).to.equal(2);
      });

      describe('if unusedActions.size is greater than zero', function() {
        it('should call offlineReplanning._random with a min and max value', function() {
          const plan = {
            actions: ['ACTION_ONE'],
          };
          offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
          setOperations.difference.onCall(0).returns(new Set());
          setOperations.difference.onCall(1).returns(new Set(['UNUSED', 'UNUSED2']));

          offlineReplanning._chooseAction(plan);

          expect(offlineReplanning._random.args).to.eql([
            [0, 1],
          ]);
        });

        it('should return the unusedAction at the index returned by offlineReplanning._random', function() {
          const plan = {
            actions: ['ACTION_ONE'],
          };
          offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
          setOperations.difference.onCall(0).returns(new Set());
          setOperations.difference.onCall(1).returns(new Set(['UNUSED', 'UNUSED2']));
          offlineReplanning._random.returns(1);

          const chosen = offlineReplanning._chooseAction(plan);

          expect(chosen).to.eql('UNUSED2');
        });
      });

      describe('if unusedActions.size is not greater than zero', function() {
        it('should call offlineReplanning._getLeastOccurringActionInPath' +
        'with the plan and nonZeroCountActions', function() {
          const plan = {
            actions: ['ACTION_ONE'],
          };
          offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
          setOperations.difference.returns(new Set([]));

          offlineReplanning._chooseAction(plan);

          expect(offlineReplanning._getLeastOccurringActionInPath.args).to.eql([
            [
              {
                actions: ['ACTION_ONE'],
              },
              new Set(['ACTION_ONE', 'ACTION_TWO']),
            ],
          ]);
        });

        describe('when leastOccurringActionInPath is a truthy value', function() {
          it('should return the leastOccurringActionInPath', function() {
            const plan = {
              actions: ['ACTION_ONE'],
            };
            offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
            setOperations.difference.returns(new Set([]));
            offlineReplanning._getLeastOccurringActionInPath.returns('LEAST_OCCURRING');

            const chosen = offlineReplanning._chooseAction(plan);

            expect(chosen).to.eql('LEAST_OCCURRING');
          });
        });

        describe('when leastOccurringActionInPath is a falsey value', function() {
          it('should return null', function() {
            it('should return the leastOccurringActionInPath', function() {
              const plan = {
                actions: ['ACTION_ONE'],
              };
              offlineReplanning._filterZeroActionCountActions.returns(new Set(['ACTION_ONE', 'ACTION_TWO']));
              setOperations.difference.returns(new Set([]));
              offlineReplanning._getLeastOccurringActionInPath.returns(false);

              const chosen = offlineReplanning._chooseAction(plan);

              expect(chosen).to.eql(null);
            });
          });
        });
      });
    });
  });

  describe('_getLeastOccurringActionInPath', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if plan.path is an empty array', function() {
      it('should return null', function() {
        const plan = {
          path: [],
        };

        const result = offlineReplanning._getLeastOccurringActionInPath(plan);

        expect(result).to.equal(null);
      });
    });

    describe('for each action in plan.path', function() {
      describe('if the passed in actions does not contain the action of plan.path', function() {
        it('should not set set an action in actionOccurrencesInPath', function() {
          const plan = {
            path: ['MY_ACTION'],
          };
          const actionOccurrencesInPath = new Map();

          offlineReplanning._getLeastOccurringActionInPath(plan, new Set(), actionOccurrencesInPath);

          expect(actionOccurrencesInPath).to.deep.equal(new Map());
        });
      });
      describe('if the passed in actions contains the action of plan.path', function() {
        describe('if actionOccurrencesInPath has the current action', function() {
          it('should increment the occurrences of the current action by 1', function() {
            const plan = {
              path: ['MY_ACTION'],
            };
            const actions = new Set(['MY_ACTION']);
            const actionOccurrencesInPath = new Map([
              ['MY_ACTION', 1],
            ]);

            offlineReplanning._getLeastOccurringActionInPath(plan, actions, actionOccurrencesInPath);

            expect(actionOccurrencesInPath).to.deep.equal(new Map([
              ['MY_ACTION', 2],
            ]));
          });
        });
        describe('if actionOccurrencesInPath does not have the action of plan.path', function() {
          it('should set the action in actionOccurrencesInPath', function() {
            const plan = {
              path: ['MY_ACTION'],
            };
            const actions = new Set(['MY_ACTION']);
            const actionOccurrencesInPath = new Map();

            offlineReplanning._getLeastOccurringActionInPath(plan, actions, actionOccurrencesInPath);

            expect(actionOccurrencesInPath).to.deep.equal(new Map([
              ['MY_ACTION', 1],
            ]));
          });
        });
      });

      describe('if the actionOccurrencesInPath.size is greater than 0', function() {
        describe('for each action in actionOccurrencesInPath', function() {
          describe('if the occurrences of the current action is less than the leastOccurringAction', function() {
            it('should set leastOccurringAction to the current action', function() {
              const plan = {
                path: ['MY_ACTION', 'MY_ACTION', 'MY_ACTION_2'],
              };
              const actions = new Set(['MY_ACTION', 'MY_ACTION_2']);

              const result = offlineReplanning._getLeastOccurringActionInPath(plan, actions);

              expect(result).to.equal('MY_ACTION_2');
            });
          });
          describe('if the occurrences of the current action is equal to the leastOccurringAction', function() {
            it('should set leastOccurringAction to the current action', function() {
              const plan = {
                path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_3'],
              };
              const actions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3']);

              const result = offlineReplanning._getLeastOccurringActionInPath(plan, actions);

              expect(result).to.equal('MY_ACTION_2');
            });
          });
          describe('if the occurrences of the current action is greater than to the leastOccurringAction', function() {
            it('should set leastOccurringAction to the current action', function() {
              const plan = {
                path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION'],
              };
              const actions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3']);

              const result = offlineReplanning._getLeastOccurringActionInPath(plan, actions);

              expect(result).to.equal('MY_ACTION_2');
            });
          });
        });
      });
      describe('if the actionOccurrencesInPath.size is not greater than 0', function() {
        it('should return null', function() {
          const plan = {
            path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION'],
          };
          const actions = new Set([]);

          const result = offlineReplanning._getLeastOccurringActionInPath(plan, actions);

          expect(result).to.equal(null);
        });
      });
    });

    describe('if there are two unique actions, one duplicate, and one triplicate action', function() {
      it('should have an occurrence of 1, 2, and 3 for the unique, duplicate, and triplicate actions, ' +
        'respectively', function() {
        const plan = {
          path: [
            'MY_ACTION', 'MY_ACTION_3', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_4', 'MY_ACTION_4', 'MY_ACTION_4',
          ],
        };
        const actions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_4']);
        const actionOccurrencesInPath = new Map();

        offlineReplanning._getLeastOccurringActionInPath(plan, actions, actionOccurrencesInPath);

        expect(actionOccurrencesInPath).to.deep.equal(new Map([
          ['MY_ACTION', 1],
          ['MY_ACTION_2', 1],
          ['MY_ACTION_3', 2],
          ['MY_ACTION_4', 3],
        ]));
      });
    });
  });

  describe('_getActionWithSameComponent', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if plan.lastAction is truthy', function() {
      describe('for each unusedAction of unsatisfiedActions', function() {
        describe('if the lastActionComponent is equal to the current unsatisfiedActionComponent', function() {
          it('should return the current action', function() {
            const plan = {
              lastAction: 'myComponent.MY_ACTION',
            };
            const unusedActions = new Set(['myComponent.MY_ACTION_2']);

            const result = offlineReplanning._getActionWithSameComponent(plan, unusedActions);

            expect(result).to.equal('myComponent.MY_ACTION_2');
          });
        });
      });
    });

    describe('if the lastActionComponent is not equal to the any unsatisfiedActionComponent', function() {
      it('should return null', function() {
        const plan = {
          lastAction: 'myComponent.MY_ACTION',
        };
        const unusedActions = new Set(['myComponentTwo.MY_ACTION_3', 'myComponentThree.MY_ACTION_5']);

        const result = offlineReplanning._getActionWithSameComponent(plan, unusedActions);

        expect(result).to.equal(null);
      });
    });
    describe('if plan.lastAction is falsy', function() {
      it('should return null', function() {
        const plan = {};

        const result = offlineReplanning._getActionWithSameComponent(plan);

        expect(result).to.equal(null);
      });
    });
  });

  describe('_filterZeroActionCountActions', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in unusedActions is an empty set', function() {
      it('should return an empty set', function() {
        const unusedActions = new Set();

        const result = offlineReplanning._filterZeroActionCountActions(unusedActions);

        expect(result).to.deep.equal(new Set());
      });
    });

    describe('for each unusedAction in the passed in unusedActions', function() {
      describe('if the actionCount of the current unusedAction is greater than 0', function() {
        it('should be add to the filteredActions', function() {
          const unusedActions = new Set(['MY_ACTION']);
          offlineReplanning._actionOccurrences = new Map([
            ['MY_ACTION', 1],
          ]);

          const result = offlineReplanning._filterZeroActionCountActions(unusedActions);

          expect(result).to.deep.equal(new Set(['MY_ACTION']));
        });
      });

      describe('if the actionCount of the current unusedAction is not greater than 0', function() {
        it('should not be add to the filteredActions', function() {
          const unusedActions = new Set(['MY_ACTION']);
          offlineReplanning._actionOccurrences = new Map([
            ['MY_ACTION', 0],
          ]);

          const result = offlineReplanning._filterZeroActionCountActions(unusedActions);

          expect(result).to.deep.equal(new Set());
        });
      });
    });

    describe('if there are 5 actions in the passed in unusedActions with counts of 6,0,298,0,3, ' +
      'respectively', function() {
      it('should add the first, third, and fifth actions to the filteredActions', function() {
        const unusedActions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_4', 'MY_ACTION_5']);
        offlineReplanning._actionOccurrences = new Map([
          ['MY_ACTION', 6],
          ['MY_ACTION_2', 0],
          ['MY_ACTION_3', 298],
          ['MY_ACTION_4', 0],
          ['MY_ACTION_5', 3],
          ['MY_ACTION_6', 0],
        ]);

        const result = offlineReplanning._filterZeroActionCountActions(unusedActions);

        expect(result).to.deep.equal(new Set(['MY_ACTION', 'MY_ACTION_3', 'MY_ACTION_5']));
      });
    });
  });

  describe('_getMostOccurringAction', function() {
    let Emitter;
    let plannerEventDispatch;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in possibleActions is an empty set', function() {
      it('should return null', function() {
        const possibleActions = new Set();

        const result = offlineReplanning._getMostOccurringAction(possibleActions);

        expect(result).to.equal(null);
      });
    });

    describe('for each possibleAction of the passed in possibleActions', function() {
      describe('if the mostOccurringActionCount is less than the current possibleAction\'s occurrences', function() {
        it('should set mostOccurringAction to the current possibleAction', function() {
          offlineReplanning._actionOccurrences = new Map([
            ['MY_ACTION', 1],
          ]);
          const possibleActions = new Set(['MY_ACTION']);

          const result = offlineReplanning._getMostOccurringAction(possibleActions);

          expect(result).to.equal('MY_ACTION');
        });
      });
    });

    describe('if all possibleActions have a count of 0 in offlineReplanning._actionOccurrences', function() {
      it('should return null', function() {
        offlineReplanning._actionOccurrences = new Map([
          ['MY_ACTION', 0],
          ['MY_ACTION_2', 0],
          ['MY_ACTION_3', 0],
        ]);
        const possibleActions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3']);

        const result = offlineReplanning._getMostOccurringAction(possibleActions);

        expect(result).to.equal(null);
      });
    });

    describe('if the passed in possibleActions contains action with counts of 2, 0, 3, 99, 22 in ' +
      'offlineReplanning._actionOccurrences, respectively', function() {
      it('should return the fourth action', function() {
        offlineReplanning._actionOccurrences = new Map([
          ['MY_ACTION', 2],
          ['MY_ACTION_2', 0],
          ['MY_ACTION_3', 3],
          ['MY_ACTION_4', 99],
          ['MY_ACTION_5', 22],
        ]);
        const possibleActions = new Set(['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_4', 'MY_ACTION_5']);

        const result = offlineReplanning._getMostOccurringAction(possibleActions);

        expect(result).to.equal('MY_ACTION_4');
      });
    });
  });

  describe('_detectLoop', function() {
    let Emitter;
    let plannerEventDispatch;
    let lodash;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      lodash = {
        isEqual: sinon.stub(),
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', lodash);
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the indexOfRepeatingAction equals the length of plan.path minus one', function() {
      it('should return the number "-1"', function() {
        const plan = {
          path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3'],
          lastAction: 'MY_ACTION_3',
        };

        const result = offlineReplanning._detectLoop(plan);

        expect(result).to.equal(-1);
      });
    });

    describe('if the indexOfRepeatingAction is the number "-1"', function() {
      it('should return the number "-1"', function() {
        const plan = {
          path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3'],
          lastAction: 'MY_ACTION_5',
        };

        const result = offlineReplanning._detectLoop(plan);

        expect(result).to.equal(-1);
      });
    });

    describe('if the indexOfRepeatingAction if not the last item in plan.path and is not the number "-1"', function() {
      describe('while it indexOfRepeatingAction is not equal to the length of plan.path minus one or the ' +
        'the number "-1"', function() {
        describe('if the earlierSequenceStartIndex is greater than 0', function() {
          it('should call _.isEqual once with the earlierSequence and the potentiallyRepeatingSequence', function() {
            const plan = {
              path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_3'],
              lastAction: 'MY_ACTION_3',
            };

            offlineReplanning._detectLoop(plan);

            expect(lodash.isEqual.args).to.deep.equal([
              [
                ['MY_ACTION_2'],
                ['MY_ACTION_2'],
              ],
            ]);
          });

          describe('if _.isEqual returns a truthy value', function() {
            it('should return the indexOfRepeatingAction', function() {
              const plan = {
                path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_3'],
                lastAction: 'MY_ACTION_3',
              };
              lodash.isEqual.returns(true);

              const result = offlineReplanning._detectLoop(plan);

              expect(result).to.equal(2);
            });
          });

          describe('if _.isEqual returns a falsy value and there are no other repeated actions', function() {
            it('should return the number "-1"', function() {
              const plan = {
                path: ['MY_ACTION', 'MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_3'],
                lastAction: 'MY_ACTION_3',
              };
              lodash.isEqual.returns(false);

              const result = offlineReplanning._detectLoop(plan);

              expect(result).to.equal(-1);
            });
          });
        });
        describe('if the earlierSequenceStartIndex is equal to 0', function() {
          it('should call _.isEqual once with the earlierSequence and the potentiallyRepeatingSequence', function() {
            const plan = {
              path: ['MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_3'],
              lastAction: 'MY_ACTION_3',
            };

            offlineReplanning._detectLoop(plan);

            expect(lodash.isEqual.args).to.deep.equal([
              [
                ['MY_ACTION_2'],
                ['MY_ACTION_2'],
              ],
            ]);
          });
        });
        describe('if the earlierSequenceStartIndex is not greater than or equal to 0', function() {
          it('should not call _.isEqual', function() {
            const plan = {
              path: ['MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_2', 'MY_ACTION_3'],
              lastAction: 'MY_ACTION_3',
            };

            offlineReplanning._detectLoop(plan);

            expect(lodash.isEqual.callCount).to.equal(0);
          });
        });
      });
    });

    describe('if plan.path includes a 3 repeating actions with the second one starting it sequence', function() {
      it('should call _.isEqual twice with the two earlierSequences and potentiallyRepeatingSequences', function() {
        const plan = {
          path: [
            'MY_ACTION', 'MY_ACTION_5', 'MY_ACTION_8', 'MY_ACTION_4', 'MY_ACTION_3', 'MY_ACTION_2', 'MY_ACTION_3',
            'MY_ACTION_2', 'MY_ACTION_3',
          ],
          lastAction: 'MY_ACTION_3',
        };

        offlineReplanning._detectLoop(plan);

        expect(lodash.isEqual.args).to.deep.equal([
          [
            ['MY_ACTION_5', 'MY_ACTION_8', 'MY_ACTION_4'],
            ['MY_ACTION_2', 'MY_ACTION_3', 'MY_ACTION_2'],
          ],
          [
            ['MY_ACTION_2'],
            ['MY_ACTION_2'],
          ],
        ]);
      });
    });
  });

  describe('_backtrack', function() {
    let Emitter;
    let plannerEventDispatch;
    let callback;
    let next;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };
      next = sinon.stub();
      callback = sinon.stub();
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('while index is greater than 0', function() {
      it('should call offlineReplanning.emitAsync with the event "searchNode.clone", the saved plan at the ' +
        'current index and next', function() {
        offlineReplanning._savedPlans = ['planZero', 'planOne'];
        const generator = offlineReplanning._backtrack(1, callback);

        generator.next();
        generator.next(next);

        expect(offlineReplanning.emitAsync.args).to.deep.equal([
          [
            'searchNode.clone',
            'planOne',
            next,
          ],
        ]);
      });

      describe('if actions.size is greater than 0', function() {
        it('should delete the action from backtrackPlan.actions', function() {
          const backtrackPlan = {
            actions: new Set(['MY_ACTION', 'MY_ACTION_2']),
          };
          offlineReplanning._savedPlans = [{}, {}, {
            lastAction: 'MY_ACTION',
          }];
          const generator = offlineReplanning._backtrack(1, callback);

          generator.next();
          generator.next(next);
          generator.next(backtrackPlan);

          expect(backtrackPlan.actions).to.deep.equal(new Set(['MY_ACTION_2']));
        });

        it('should delete the action from the the plan in offlineReplanning._savedPlans by re', function() {
          const backtrackPlan = {
            actions: new Set(['MY_ACTION', 'MY_ACTION_2']),
          };
          offlineReplanning._savedPlans = [{}, backtrackPlan, {
            lastAction: 'MY_ACTION',
          }];
          const generator = offlineReplanning._backtrack(1, callback);

          generator.next();
          generator.next(next);
          generator.next(backtrackPlan);

          expect(offlineReplanning._savedPlans[1].actions).to.deep.equal(new Set(['MY_ACTION_2']));
        });

        it('should call the callback once with null, and an object with the backtrackPlan and ' +
          'newSavedPlans', function() {
          const backtrackPlan = {
            actions: new Set(['MY_ACTION', 'MY_ACTION_2']),
          };
          offlineReplanning._savedPlans = [{}, backtrackPlan, {
            lastAction: 'MY_ACTION',
          }];
          const generator = offlineReplanning._backtrack(1, callback);

          generator.next();
          generator.next(next);
          generator.next(backtrackPlan);

          expect(callback.args).to.deep.equal([
            [
              null,
              {
                backtrackPlan: {
                  actions: new Set(['MY_ACTION_2']),
                },
                newSavedPlans: [{}, {
                  actions: new Set(['MY_ACTION_2']),
                }],
                removed: [
                  'MY_ACTION',
                ],
              },
            ],
          ]);
        });
      });

      describe('if actions.size is not greater than 0 and the decremented index is equal to 0', function() {
        it('call offlineReplanning.emitAsync again with the event "searchNode.clone", ', function() {
          const backtrackPlan = {
            actions: new Set(['MY_ACTION']),
          };
          offlineReplanning._savedPlans = [
            {
              actions: new Set(['MY_ACTION_6']),
              lastAction: 'MY_ACTION_4',
            },
            backtrackPlan,
            {
              lastAction: 'MY_ACTION',
            },
          ];
          const generator = offlineReplanning._backtrack(1, callback);

          generator.next();
          generator.next(next);
          generator.next(backtrackPlan);

          expect(offlineReplanning.emitAsync.args[1]).to.deep.equal([
            'searchNode.clone',
            {
              actions: new Set(['MY_ACTION_6']),
              lastAction: 'MY_ACTION_4',
            },
            next,
          ]);
        });
      });

      describe('if actions.size is not greater than 0 and the decremented index is greater than 0', function() {
        it('call offlineReplanning.emitAsync again with the event "searchNode.clone", ', function() {
          offlineReplanning._savedPlans = [
            {
              actions: new Set(['MY_ACTION_6']),
              lastAction: 'MY_ACTION_4',
            },
            {
              actions: new Set(['MY_ACTION']),
              lastAction: 'MY_ACTION_3',
            },
            {
              actions: new Set(['MY_ACTION_9']),
              lastAction: 'MY_ACTION_7',
            },
            {
              actions: new Set(['MY_ACTION_8']),
              lastAction: 'MY_ACTION_9',
            },
          ];
          const generator = offlineReplanning._backtrack(2, callback);

          generator.next();
          generator.next(next);
          generator.next(offlineReplanning._savedPlans[2]);

          expect(offlineReplanning.emitAsync.args[1]).to.deep.equal([
            'searchNode.clone',
            {
              actions: new Set(['MY_ACTION']),
              lastAction: 'MY_ACTION_3',
            },
            next,
          ]);
        });
      });

      describe('if decremented index is not greater than or equal to 0', function() {
        it('should call back will null, and an object null for both the backtrackPlan and newSavedPlans', function() {
          offlineReplanning._savedPlans = [
            {
              actions: new Set(['MY_ACTION_3']),
              lastAction: 'MY_ACTION_4',
            },
            {
              actions: new Set(['MY_ACTION']),
              lastAction: 'MY_ACTION_3',
            },
          ];
          const generator = offlineReplanning._backtrack(0, callback);

          generator.next();
          generator.next(next);
          generator.next(offlineReplanning._savedPlans[0]);

          expect(callback.args).to.deep.equal([
            [
              null,
              {
                backtrackPlan: null,
                newSavedPlans: null,
              },
            ],
          ]);
        });
      });
    });

    describe('if there are three possible backtrack plans and none have actions.size greather than ' +
      '0 after deleting the last action', function() {
      it('should call offlineReplanning.emitAsync three times with each possible plan', function() {
        offlineReplanning._savedPlans = [
          {
            actions: new Set(['MY_ACTION_3']),
            lastAction: 'MY_ACTION_4',
          },
          {
            actions: new Set(['MY_ACTION_7']),
            lastAction: 'MY_ACTION_3',
          },
          {
            actions: new Set(['MY_ACTION_9']),
            lastAction: 'MY_ACTION_7',
          },
          {
            actions: new Set(['MY_ACTION_8']),
            lastAction: 'MY_ACTION_9',
          },
        ];
        const generator = offlineReplanning._backtrack(2, callback);

        generator.next();
        generator.next(next);
        generator.next(offlineReplanning._savedPlans[2]);
        generator.next(offlineReplanning._savedPlans[1]);
        generator.next(offlineReplanning._savedPlans[0]);

        expect(offlineReplanning.emitAsync.args).to.deep.equal([
          [
            'searchNode.clone',
            {
              actions: new Set(['MY_ACTION_9']),
              lastAction: 'MY_ACTION_7',
            },
            next,
          ],
          [
            'searchNode.clone',
            {
              actions: new Set(['MY_ACTION_7']),
              lastAction: 'MY_ACTION_3',
            },
            next,
          ],
          [
            'searchNode.clone',
            {
              actions: new Set(['MY_ACTION_3']),
              lastAction: 'MY_ACTION_4',
            },
            next,
          ],
        ]);
      });
    });
  });

  describe('_comparePlan', function() {
    let update;
    let hash;
    let crypto;
    let Emitter;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      update = {
        digest: sinon.stub(),
      };
      hash = {
        update: sinon.stub().returns(update),
      };
      crypto = {
        createHash: sinon.stub().returns(hash),
      };

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', crypto);
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call createHash with "sha256"', function() {
      const plan = {path: 'myPath'};
      offlineReplanning._comparePlan(plan);

      expect(crypto.createHash.args).to.eql([
        ['sha256'],
      ]);
    });

    it('should update the hash with the plan path', function() {
      const plan = {path: 'myPath'};
      offlineReplanning._comparePlan(plan);

      expect(hash.update.args).to.eql([
        ['\"myPath\"'],
      ]);
    });

    it('should create a base64 digest of the hash', function() {
      const plan = {path: 'myPath'};
      offlineReplanning._comparePlan(plan);

      expect(update.digest.args).to.eql([
        ['base64'],
      ]);
    });

    describe('when the hash is in offlineReplanning._planHashes', function() {
      it('should return the plan hash', function() {
        const plan = {path: 'myPath'};
        offlineReplanning._planHashes = new Map();
        offlineReplanning._planHashes.set('myHash', 'myPlan');
        update.digest.returns('myHash');

        const compared = offlineReplanning._comparePlan(plan);

        expect(compared).to.eql('myPlan');
      });
    });

    describe('when the hash is not in offlineReplanning._planHashes', function() {
      it('should return undefined', function() {
        const plan = {path: 'myPath'};
        offlineReplanning._planHashes = new Map();
        offlineReplanning._planHashes.set('myHash', 'myPlan');
        update.digest.returns('notMyHash');

        const compared = offlineReplanning._comparePlan(plan);

        expect(compared).to.eql(undefined);
      });
    });
  });

  describe('_random', function() {
    let Emitter;
    let offlineReplanning;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emitAsync = sinon.stub();
          myObject.runOn = sinon.stub();
        },
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/set-operations.js', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('crypto', {});
      mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', {});
      mockery.registerMock('../../util/config/config-handler.js', {});

      offlineReplanning = require(
          '../../../../../lib/planner/search-algorithms/offline-replanning.js',
      );
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set offlineReplanning._randomSeed', function() {
      offlineReplanning._randomSeed = 8675309;

      offlineReplanning._random(0, 100);

      expect(offlineReplanning._randomSeed).to.eql(112386);
    });

    // This function only does math. These test verifies
    // that, for a given seed, it will always return the
    // same result.
    it('should return a value', function() {
      offlineReplanning._randomSeed = 8675309;

      const result = offlineReplanning._random(0, 100);

      expect(result).to.eql(48.17644032921811);
    });

    describe('when max is a truthy value', function() {
      it('should keep the given max value', function() {
        offlineReplanning._randomSeed = 8675309;

        const min = 0;
        const max = 2;
        const result = offlineReplanning._random(min, max);

        expect(result).to.eql(0.9635288065843621);
      });
    });

    describe('when max is a falsey value', function() {
      it('should set max to 1', function() {
        offlineReplanning._randomSeed = 8675309;

        const min = 0;
        const max = false;
        const result = offlineReplanning._random(min, max);

        expect(result).to.eql(0.48176440329218106);
      });
    });

    describe('when min is a truthy value', function() {
      it('should keep given min value', function() {
        offlineReplanning._randomSeed = 8675309;

        const min = 3;
        const max = 22;
        const result = offlineReplanning._random(min, max);

        expect(result).to.eql(12.15352366255144);
      });
    });

    describe('when min is a falsey value', function() {
      it('should set min to 0', function() {
        offlineReplanning._randomSeed = 8675309;

        const min = false;
        const max = 22;
        const result = offlineReplanning._random(min, max);

        expect(result).to.eql(10.598816872427983);
      });
    });
  });
});
