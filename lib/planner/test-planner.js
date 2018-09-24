'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let testPlanner;

module.exports = testPlanner = {
  generateTests() {
    let plans = [];

    testPlanner.emit('testPlanner.createPlans', function(error, plan, done, discoveredActions) {
      if (error) {
        throw error;
      } else if (plan) {
        plans.push(plan);
      } else {
        testPlanner.emit(
            'testPlanner.reduceToMinimumSetOfPlans',
            plans,
            function(error, finalPlans) {
              if (error) {
                throw error;
              }
              testPlanner
                  .emit('testPlanner.planningFinished', finalPlans, discoveredActions);
            });
      }
    });
  },
};

Emitter.mixIn(testPlanner, plannerEventDispatch);
