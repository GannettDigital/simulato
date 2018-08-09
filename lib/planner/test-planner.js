'use strict';

const Emitter = require('../util/emitter.js');
const config = require('../util/config-handler.js');
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
                        if (config.get('plannerTestLength')) {
                            testPlanner.emit(
                                'planRefinement.refinePlans',
                                finalPlans,
                                discoveredActions,
                                {
                                    testLength: config.get('plannerTestLength'),
                                }
                            );
                        } else {
                            testPlanner
                                .emit('planner.planningFinished', finalPlans, discoveredActions);
                        }
                    });
            }
        });
    },
};

Emitter.mixIn(testPlanner, plannerEventDispatch);
