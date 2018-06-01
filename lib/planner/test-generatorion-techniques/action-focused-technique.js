'use strict';

const setOperations = require('../../util/set-operations.js');
const EventEmitter = require('events').EventEmitter;

let actionFocusedTechnique;
module.exports = actionFocusedTechnique = {
    determineActions(predeterminedGoalAction) {
        actionFocusedTechnique.emit('actionFocusedTechnique.getComponents', function(error, components) {
            let entryComponents = [];
            for (let type in components) {
                if (components[type].entryComponent) {
                    entryComponents.push(type);
                }
            }

            if (entryComponents.length === 0) {
                throw new SimulatoError.COMPONENT.NO_ENTRY_POINT('Planning failed, no entry component found');
            }

            actionFocusedTechnique
                .emit('actionFocusedTechnique.actionsDetermined', entryComponents, predeterminedGoalAction);
        });
    },
    _createPlans(entryComponents, predeterminedGoalAction) {
        let plans = [];

        actionFocusedTechnique
            .emit('actionFocusedTechnique.createPlans', entryComponents, predeterminedGoalAction,
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

Object.setPrototypeOf(actionFocusedTechnique, new EventEmitter());

actionFocusedTechnique.on('actionFocusedTechnique.actionsDetermined', actionFocusedTechnique._createPlans);
actionFocusedTechnique
    .on('actionFocusedTechnique.plansCreated', actionFocusedTechnique._reduceToMinimumSetOfPlans);
