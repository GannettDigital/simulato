'use strict';

const Emitter = require('../util/emitter.js');
const config = require('../util/config/config-handler.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let testPlanner;

module.exports = testPlanner = {
  _algorithm: null,
  generateTests() {
    testPlanner._algorithm = config.get('plannerAlgorithm');
    switch (testPlanner._algorithm) {
      case 'actionTree': 
        testPlanner._generateActionTree();
        break;
      default:
        testPlanner._generateStateSpace();
    }
  },
  _generateActionTree() {
    testPlanner.emit('testPlanner.createActionTreePlans', function(error, plans, discoveredActions) {
      if (error) {
        throw error;
      }

      testPlanner.emit('testPlanner.reduceToMinimumSetOfPlans', plans, testPlanner._algorithm, function(error, finalPlans) {
        if (error) {
          throw error;
        }
        // let testLength = config.get('plannerTestLength');
        let testLength = false;
        // TODO: Get offline replanning working with actionTree algorithm
        if (testLength) {
          testPlanner.emit('offlineReplanning.replan', finalPlans, discoveredActions, testPlanner._algorithm, {testLength});
        } else {
          testPlanner.emit('planner.planningFinished', finalPlans, discoveredActions, testPlanner._algorithm);
        }
      });
    });
  },
  _generateStateSpace() {
    let plans = [];
    testPlanner.emit('testPlanner.createForwardStateSpaceSearchHeuristicPlans', function(error, plan, done, discoveredActions) {
      if (error) {
        throw error;
      } else if (plan) {
        plans.push(plan);
      } else {
        testPlanner.emit(
            'testPlanner.reduceToMinimumSetOfPlans',
            plans,
            testPlanner._algorithm,
            function(error, finalPlans) {
              if (error) {
                throw error;
              }
              let testLength = config.get('plannerTestLength');
              if (testLength) {
                testPlanner.emit(
                    'offlineReplanning.replan',
                    finalPlans,
                    discoveredActions,
                    testPlanner._algorithm,
                    {
                      testLength,
                    },
                );
              } else {
                testPlanner
                    .emit('planner.planningFinished', finalPlans, discoveredActions, testPlanner._algorithm);
              }
            });
      }
    });
  }
};

Emitter.mixIn(testPlanner, plannerEventDispatch);
