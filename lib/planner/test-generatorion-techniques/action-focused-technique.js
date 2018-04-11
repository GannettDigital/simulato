'use strict';

const setOperations = require('../set-operations.js');
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
                function(error, plan, done, planningProblem) {
                    if (error) {
                        console.log(error);
                    } else if (plan) {
                        plans.push(plan);
                    } else if (done) {
                        actionFocusedTechnique
                            .emit('actionFocusedTechnique.plansCreated', plans, planningProblem);
                    }
                }
            );
    },
    _reduceToMinimumSetOfPlans(plans, planningProblem) {
        let finalPlans = [];

        plans.forEach(function(plan, index) {
            let planPath = plan.path;
            let hasSuperset = false;

            let plansWithCurrentPlanRemoved = plans.filter(function(plan, filterIndex) {
                return index !== filterIndex;
            });

            for (let myPlan of plansWithCurrentPlanRemoved) {
                if (setOperations.isSuperset(myPlan.path, planPath)) {
                    hasSuperset = true;
                    break;
                }
            }

            if (!hasSuperset) {
                finalPlans.push(plan);
            }
        });

        actionFocusedTechnique.emit('actionFocusedTechnique.planningFinished', finalPlans, planningProblem);
    },
};

Object.setPrototypeOf(actionFocusedTechnique, new EventEmitter());

actionFocusedTechnique.on('actionFocusedTechnique.actionsDetermined', actionFocusedTechnique._createPlans);
actionFocusedTechnique
    .on('actionFocusedTechnique.plansCreated', actionFocusedTechnique._reduceToMinimumSetOfPlans);
