'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/test-planner.js', function() {
  describe('on file require', function() {
    let Emitter;
    let testPlanner;
    let plannerEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/test-planner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('../util/config/config-handler.js', {});
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with testPlanner and plannerEventDispatch as parameters', function() {
      testPlanner = require('../../../../lib/planner/test-planner.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          testPlanner,
          plannerEventDispatch,
        ],
      ]);
    });
  });

  describe('generateTests', function() {
    let Emitter;
    let testPlanner;
    let plannerEventDispatch;
    let config;
    let actionTree;
    let forwardStateSpaceSearchHeuristic;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/test-planner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      config = {
        get: sinon.stub(),
      };

      actionTree = sinon.stub();
      forwardStateSpaceSearchHeuristic = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('../util/config/config-handler.js', config);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);

      testPlanner = require('../../../../lib/planner/test-planner.js');
      testPlanner._generateActionTree = actionTree;
      testPlanner._generateStateSpace = forwardStateSpaceSearchHeuristic;
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('when testPlanner._algorithm is actionTree', function() {
      it('should call _generateActionTree()', function() {
        config.get.onCall(0).returns('actionTree');
        testPlanner.generateTests();

        expect(testPlanner._generateActionTree.calledOnce).to.be.true;
      });
    });

    describe('when testPlanner._algorithm is forwardStateSpaceSearchHeuristic', function() {
      it('should call _generateStateSpace()', function() {
        config.get.onCall(0).returns('forwardStateSpaceSearchHeuristic');
        testPlanner.generateTests();

        expect(testPlanner._generateStateSpace.calledOnce).to.be.true;
      });
    });
  });

  describe('_generateActionTree', function() {
    let Emitter;
    let testPlanner;
    let plannerEventDispatch;
    let config;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/test-planner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();
      config = {
        get: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('../util/config/config-handler.js', config);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);

      testPlanner = require('../../../../lib/planner/test-planner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call testPlanner.emit with the event' +
    '\testPlanner.createActionTreePlans\'', function() {
      testPlanner._generateActionTree();

      expect(testPlanner.emit.args[0][0]).to.deep.equal('testPlanner.createActionTreePlans');
    });

    describe('when the callback for testPlanner.emit with the event ' +
    '\'testPlanner.createActionTreePlans\' is called', function() {
      describe('if an error is passed in to the callback', function() {
        it('should throw an error', function() {
          testPlanner.emit.onCall(0).callsArgWith(1, new Error('An error occurred!'));

          expect(testPlanner._generateActionTree).to.throw('An error occurred!');
        });
      });

      describe('if a truthy value for done is pass in to the callback', function() {
        it('should call testPlanner.emit with the event \'testPlanner.reduceToMinimumSetOfPlans\', ' +
            'plans, and discoveredActions', function() {
          testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');

          testPlanner._generateStateSpace();

          expect(testPlanner.emit.args[1].slice(0, 2)).to.deep.equal([
            'testPlanner.reduceToMinimumSetOfPlans',
            [],
          ]);
        });

        describe('when the callback is called for testPlanner.emit with the event ' +
            '\'testPlanner.reduceToMinimumSetOfTestPlans\'', function() {
          describe('if an error is passed in', function() {
            it('should throw the error', function() {
              testPlanner._algorithm = 'actionTree';
              testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');
              testPlanner.emit.onCall(1).callsArgWith(3, new Error('An error occurred!'));

              expect(testPlanner._generateActionTree).to.throw('An error occurred!');
            });
          });

          describe('if an error is not passed in', function() {
            it('should call config.get once with the string "plannerTestLength"', function() {
              testPlanner.emit.onCall(0).callsArgWith(1, null, null, 'discoveredActions');
              testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');

              testPlanner._generateActionTree();

              expect(config.get.args[0]).to.deep.equal([
                'plannerTestLength',
              ]);
            });

            describe('if testLength is a truthy value', function() {
              it('should call testPlanner.emit with the event \'offlineReplanning.replan\', ' +
                    'the finalPlans, discoveredActions, and an object with the testLength', function() {
                testPlanner.emit.onCall(0).callsArgWith(1, null, null, 'discoveredActions');
                testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');
                testPlanner._algorithm = 'actionTree';
                config.get.onCall(0).returns(5);

                testPlanner._generateActionTree();

                expect(testPlanner.emit.args[2]).to.deep.equal([
                  'offlineReplanning.replan',
                  'theFinalPlans',
                  'discoveredActions',
                  'actionTree',
                  {
                    testLength: 5,
                  },
                ]);
              });
            });

            describe('if testLength is a falsy value', function() {
              it('should call testPlanner.emit with the event \'testPlanner.planningFinished\', ' +
                    'the finalPlans, and discoveredActions', function() {
                testPlanner.emit.onCall(0).callsArgWith(1, null, null, 'discoveredActions');
                testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');
                testPlanner._algorithm = 'actionTree';
                config.get.onCall(0).returns(undefined);

                testPlanner._generateActionTree();

                expect(testPlanner.emit.args[2]).to.deep.equal([
                  'planner.planningFinished',
                  'theFinalPlans',
                  'discoveredActions',
                  'actionTree',
                ]);
              });
            });
          });
        });
      });
    });
  });
});

describe('_generateStateSpace', function() {
  let Emitter;
  let testPlanner;
  let plannerEventDispatch;
  let config;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/planner/test-planner.js');

    Emitter = {
      mixIn: function(myObject) {
        myObject.emit = sinon.stub();
      },
    };
    sinon.spy(Emitter, 'mixIn');
    plannerEventDispatch = sinon.stub();
    config = {
      get: sinon.stub(),
    };

    mockery.registerMock('../util/emitter.js', Emitter);
    mockery.registerMock('../util/config/config-handler.js', config);
    mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);

    testPlanner = require('../../../../lib/planner/test-planner.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call testPlanner.emit with the event' +
      '\testPlanner.createForwardStateSpaceSearchHeuristicPlans\'', function() {
    testPlanner._generateStateSpace();

    expect(testPlanner.emit.args[0][0]).to.deep.equal('testPlanner.createForwardStateSpaceSearchHeuristicPlans');
  });

  describe('when the callback for testPlanner.emit with the event ' +
      '\'testPlanner.createPlans\' is called', function() {
    describe('if an error is passed in to the callback', function() {
      it('should throw an error', function() {
        testPlanner.emit.onCall(0).callsArgWith(1, new Error('An error occurred!'));

        expect(testPlanner._generateStateSpace).to.throw('An error occurred!');
      });
    });

    describe('if a plan is passed in to the callback', function() {
      it('should add it to the plans array', function() {
        testPlanner._generateStateSpace();
        const callback = testPlanner.emit.args[0][1];

        callback(null, 'myPlan');
        callback(null, null, true);

        expect(testPlanner.emit.args[1][1]).to.deep.equal(['myPlan']);
      });
    });

    describe('if a truthy value for done is pass in to the callback', function() {
      it('should call testPlanner.emit with the event \'testPlanner.reduceToMinimumSetOfPlans\', ' +
            'plans, and discoveredActions', function() {
        testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');

        testPlanner._generateStateSpace();

        expect(testPlanner.emit.args[1].slice(0, 2)).to.deep.equal([
          'testPlanner.reduceToMinimumSetOfPlans',
          [],
        ]);
      });

      describe('when the callback is called for testPlanner.emit with the event ' +
            '\'testPlanner.reduceToMinimumSetOfTestPlans\'', function() {
        describe('if an error is passed in', function() {
          it('should throw the error', function() {
            testPlanner._algorithm = 'default';
            testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');
            testPlanner.emit.onCall(1).callsArgWith(3, new Error('An error occurred!'));

            expect(testPlanner._generateStateSpace).to.throw('An error occurred!');
          });
        });

        describe('if an error is not passed in', function() {
          it('should call config.get once with the string "plannerTestLength"', function() {
            testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');
            testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');

            testPlanner._generateStateSpace();

            expect(config.get.args[0]).to.deep.equal([
              'plannerTestLength',
            ]);
          });

          describe('if testLength is a truthy value', function() {
            it('should call testPlanner.emit with the event \'offlineReplanning.replan\', ' +
                    'the finalPlans, discoveredActions, and an object with the testLength', function() {
              testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');
              testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');
              testPlanner._algorithm = 'forwardStateSpaceSearchHeuristic';
              config.get.onCall(0).returns(5);

              testPlanner._generateStateSpace();

              expect(testPlanner.emit.args[2]).to.deep.equal([
                'offlineReplanning.replan',
                'theFinalPlans',
                'discoveredActions',
                'forwardStateSpaceSearchHeuristic',
                {
                  testLength: 5,
                },
              ]);
            });
          });

          describe('if testLength is a  falsy value', function() {
            it('should call testPlanner.emit with the event \'testPlanner.planningFinished\', ' +
                    'the finalPlans, and discoveredActions', function() {
              testPlanner.emit.onCall(0).callsArgWith(1, null, null, true, 'discoveredActions');
              testPlanner.emit.onCall(1).callsArgWith(3, null, 'theFinalPlans');
              testPlanner._algorithm = 'forwardStateSpaceSearchHeuristic';

              testPlanner._generateStateSpace();

              expect(testPlanner.emit.args[2]).to.deep.equal([
                'planner.planningFinished',
                'theFinalPlans',
                'discoveredActions',
                'forwardStateSpaceSearchHeuristic',
              ]);
            });
          });
        });
      });
    });
  });
});
