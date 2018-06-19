'use strict';

const setOperations = require('../../util/set-operations.js');
const Emitter = require('../../util/emitter.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');

let actionFocusedTechnique;
module.exports = actionFocusedTechnique = {
    createPlans() {
        let plans = [];

        actionFocusedTechnique
            .emit('actionFocusedTechnique.createPlans',
                function(error, plan, done, discoveredActions) {
                    if (error) {
                        console.log(error);
                    } else if (plan) {
                        plans.push(plan);
                    } else if (done) {
                        actionFocusedTechnique
                            .emit('actionFocusedTechnique.plansCreated', plans, discoveredActions);
                    }
                }
            );
    },
    _reduceToMinimumSetOfPlans(plans, discoveredActions) {
        let finalPlans = [];

        plans.forEach(function(plan, index) {
            let planPath = new Set(plan.path);
            let hasSuperset = false;

            let plansWithCurrentPlanRemoved = plans.filter(function(plan, filterIndex) {
                return index !== filterIndex;
            });

            for (let myPlan of plansWithCurrentPlanRemoved) {
                let myPlanPath = new Set(myPlan.path);
                if (setOperations.isSuperset(myPlanPath, planPath)) {
                    hasSuperset = true;
                    break;
                }
            }

            if (!hasSuperset) {
                finalPlans.push(plan);
            }
        });

        actionFocusedTechnique.emit('actionFocusedTechnique.planningFinished', finalPlans, discoveredActions);
    },
};

Emitter.mixIn(actionFocusedTechnique, plannerEventDispatch);

actionFocusedTechnique
    .on('actionFocusedTechnique.plansCreated', actionFocusedTechnique._reduceToMinimumSetOfPlans);
