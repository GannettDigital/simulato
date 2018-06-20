'use strict';

const Emitter = require('../util/emitter.js');
const configHandler = require('../util/config-handler.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');
let testPlanner;
module.exports = testPlanner = {
    generateTests() {
        let plans = [];

        testPlanner.emit('testPlanner.createPlans', function(error, plan, done, discoveredActions) {
            if (error) {
                console.log(error);
            } else if (plan) {
                plans.push(plan);
            } else if (done) {
                testPlanner.emit(
                    'testPlanner.reduceToMinimumSetOfPlans',
                    plans,
                    discoveredActions,
                    function(error, finalPlans) {
                        testPlanner
                            .emit('testPlanner.planningFinished', finalPlans, discoveredActions);
                    });
            }
        });
    },
};

Emitter.mixIn(testPlanner, plannerEventDispatch);
