'use strict';

const EventEmitter = require('events').EventEmitter;

let testPlanner;
module.exports = testPlanner = {
    generateTests(configureInfo) {
        if (configureInfo.plannerAlgorithm === 'forwardStateSpaceSearchHeuristic') {
            let plans = [];

            testPlanner.emit('testPlanner.createPlans', configureInfo.actionToCover,
                function(error, plan, done, discoveredActions) {
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
                }
            );
        }
    },
};

Object.setPrototypeOf(testPlanner, new EventEmitter());
