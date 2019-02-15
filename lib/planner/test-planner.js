'use strict';

const Emitter = require('../util/emitter.js');
const config = require('../util/config/config-handler.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let testPlanner;

module.exports = testPlanner = {
  generateTests() {
    let plans = [];

    testPlanner.emit('testPlanner.createPlans', function(error, plans, discoveredActions) {
      if (error) {
        throw error;
      }

      testPlanner.emit('testPlanner.reduceToMinimumSetOfPlans', plans, function(error, finalPlans) {
        if (error) {
          throw error;
        }
        // let testLength = config.get('plannerTestLength');
        let testLength = false;
        if (testLength) {
          testPlanner.emit('offlineReplanning.replan', finalPlans, discoveredActions, {testLength});
        } else {
          testPlanner.emit('planner.planningFinished', finalPlans, discoveredActions);
        }
      });
    });

    // testPlanner.emit('testPlanner.createPlans', function(error, plan, done, discoveredActions) {
    //   if (error) {
    //     throw error;
    //   } else if (plan) {
    //     plans.push(plan);
    //   } else {
    //     testPlanner.emit(
    //         'testPlanner.reduceToMinimumSetOfPlans',
    //         plans,
    //         function(error, finalPlans) {
    //           if (error) {
    //             throw error;
    //           }
    //           let testLength = config.get('plannerTestLength');
    //           if (testLength) {
    //             testPlanner.emit(
    //                 'offlineReplanning.replan',
    //                 finalPlans,
    //                 discoveredActions,
    //                 {
    //                   testLength,
    //                 }
    //             );
    //           } else {
    //             testPlanner
    //                 .emit('planner.planningFinished', finalPlans, discoveredActions);
    //           }
    //         });
    //   }
    // });
  },
};

Emitter.mixIn(testPlanner, plannerEventDispatch);
