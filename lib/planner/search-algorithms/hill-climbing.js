'use strict';

const Emitter = require('../../util/emitter.js');
const setOperations = require('../../util/set-operations.js');
const _ = require('lodash');

let hillClimbing;
module.exports = hillClimbing = {
    * createPlans(existingPlans, discoveredActions) {
        let next = yield;

        let plans = [];
        let satisfiedActions = new Set();
        let actionCounts = yield hillClimbing.emitAsync('hillClimbing.calculateActionCounts', existingPlans, discoveredActions, next);

        let maxPlanLength = 75;
        while (satisfiedActions.size < actionCounts.size) {
            let savedPlans = [];
            let startNodes = yield hillClimbing.emitAsync('hillClimbing.getStartNodes', next);
            let plan = startNodes[0];
            while (plan.path.length < maxPlanLength && satisfiedActions.size < actionCounts.size) {
                if (plan.actions.has(plan.lastAction)) {
                    plan.actions.delete(plan.lastAction);
                }
                if (plan.actions.size === 0) {
                    if (plan.path.length > 0) {
                        break;
                    } else {
                        throw new Error('No possible actions in starting state');
                    }
                }
                let action = yield hillClimbing.emitAsync('hillClimbing.chooseAction', plan, actionCounts, satisfiedActions, next);
                if (action === null) {
                    if (plan.path.length > 0) {
                        break;
                    } else {
                        throw new Error('No possible actions in starting state');
                    }
                }
                plan.path.push(action);
                yield hillClimbing.emitAsync('hillClimbing.applyEffects', plan, next);
                let {applicableActions} = yield hillClimbing.emitAsync('hillClimbing.getPossibleActions', plan, next);
                plan.actions = applicableActions;

                satisfiedActions.add(action);
                let prunedPlans = yield hillClimbing.emitAsync('hillClimbing.pruneExistingPlans', existingPlans, satisfiedActions, next);
                if (prunedPlans.length !== existingPlans.length) {
                    existingPlans = prunedPlans;
                    actionCounts = yield hillClimbing.emitAsync('hillClimbing.calculateActionCounts', existingPlans, discoveredActions, next);
                }
                let loopStartIndex = yield hillClimbing.emitAsync('hillClimbing.detectLoop', plan, next);
                if (loopStartIndex !== -1) {
                    let {backtrackPlan, newSavedPlans} = yield hillClimbing.emitAsync('hillClimbing.backtrack', plan, savedPlans, loopStartIndex, next);
                    if (backtrackPlan !== null) {
                        plan = backtrackPlan;
                        savedPlans = newSavedPlans;
                        console.log('I have backtracked');
                    } else {
                        // Throw an error here?!
                        console.log('I have not been able to backtrack');
                    }
                } else {
                    let copyOfPlan = yield hillClimbing.emitAsync('hillClimbing.cloneSearchNode', plan, next);
                    savedPlans.push(copyOfPlan);
                }
            }
            let duplicate = yield hillClimbing.emitAsync('hillClimbing.isDuplicate', plans, plan, next);
            if (duplicate) {
                throw new Error('Generated a duplicate plan!');
            }
            plans.push(plan);
        }

        hillClimbing.emitAsync('hillClimbing.planningFinished', plans, discoveredActions);
    },
    pruneExistingPlans(existingPlans, satisfiedActions, callback) {
        let prunedPlans = [];
        for (let plan of existingPlans) {
            let superset = setOperations.isSuperset(satisfiedActions, new Set(plan.path));
            if (!superset) {
                prunedPlans.push(plan);
            }
        }

        callback(null, prunedPlans);
    },
    isDuplicate(plans, plan, callback) {
        for (let aPlan of plans) {
            if (setOperations.isEqual(aPlan.path, new Set(plan.path))) {
                callback(null, true);
            }
        }
        callback(null, false);
    },
    * chooseAction(plan, actionCounts, satisfiedActions, callback) {
        let next = yield;

        // let unusedActions = yield hillClimbing.emitAsync('hillClimbing.getUnusedActions', plan.actions, satisfiedActions, next);

        let nonZeroActionCountActions = yield hillClimbing.emitAsync('hillClimbing.filterZeroActionCountActions', plan.actions, actionCounts, next);

        let unsatisfiedActions = setOperations.difference(nonZeroActionCountActions, satisfiedActions);
        let actionWithSameComponent = yield hillClimbing.emitAsync('hillClimbing.getActionWithSameComponent', plan, unsatisfiedActions, next);
        if (actionWithSameComponent) {
            return callback(null, actionWithSameComponent);
        } else if (unsatisfiedActions.size > 0) {
            return callback(null, [...unsatisfiedActions][0]);
        }

        let unusedActions = setOperations.difference(nonZeroActionCountActions, new Set(plan.path));
        // let filteredActions = yield hillClimbing.emitAsync('hillClimbing.filterUnusedActions', unusedActions, actionCounts, next);
        let mostOccurringUnusedAction = yield hillClimbing.emitAsync('hillClimbing.getMostOccurringAction', unusedActions, actionCounts, next);
        if (mostOccurringUnusedAction) {
            return callback(null, mostOccurringUnusedAction);
        } else if (unusedActions.size > 0) {
            return callback(null, [...unusedActions][0]);
        }

        let leastOccurringActionInPath = yield hillClimbing.emitAsync('hillClimbing.getLeastOccurringActionInPath', plan, nonZeroActionCountActions, next);
        if (leastOccurringActionInPath) {
            return callback(null, leastOccurringActionInPath);
        }

        return callback(null, null);
    },
    getLeastOccurringActionInPath(plan, actions, callback) {
        let actionOccurrencesInPath = new Map();

        let leastOccurringAction = null;
        let leastOccurringActionOccurrences;
        for (let action of plan.path) {
            if (actions.has(action)) {
                if (actionOccurrencesInPath.has(action)) {
                    let occurrences = actionOccurrencesInPath.get(action);
                    actionOccurrencesInPath.set(action, ++occurrences);
                    if (occurrences < leastOccurringActionOccurrences) {
                        leastOccurringAction = action;
                        leastOccurringActionOccurrences = occurrences;
                    }
                } else {
                    actionOccurrencesInPath.set(action, 1);
                    leastOccurringAction = action;
                    leastOccurringActionOccurrences = 1;
                }
            }
        }

        callback(null, leastOccurringAction);
    },
    getActionWithSameComponent(plan, unsatisfiedActions, callback) {
        if (plan.lastAction) {
            let lastActionComponent = plan.lastAction.split('.')[0];
            for (let action of unsatisfiedActions) {
                let unsatisfiedActionComponent = action.split('.')[0];
                if (lastActionComponent === unsatisfiedActionComponent) {
                    return callback(null, action);
                }
            }
        }
        return callback(null, null);
    },
    filterZeroActionCountActions(unusedActions, actionCounts, callback) {
        let filteredActions = new Set();
        for (let action of unusedActions) {
            let actionCount = actionCounts.get(action);
            if (actionCount > 0 ) {
                filteredActions.add(action);
            }
        }
        return callback(null, filteredActions);
    },
    getMostOccurringAction(possibleActions, actionCounts, callback) {
        let mostOccurringAction = null;
        for (let action of possibleActions) {
            let mostOccurringActionCount = actionCounts.get(mostOccurringAction) || 0;
            let occurrences = actionCounts.get(action);
            if (mostOccurringActionCount < occurrences) {
                mostOccurringAction = action;
            }
        }
        callback(null, mostOccurringAction);
    },
    detectLoop(plan, callback) {
        let index = plan.path.indexOf(plan.lastAction);
        if (index === plan.path.length -1 || index === -1) {
            return callback(null, -1);
        } else {
            while (index !== -1 && index !== plan.path.length -1) {
                let potentiallyRepeatingSequence = plan.path.slice(index + 1, plan.path.length - 1);
                let earlierSequenceStartIndex = index - potentiallyRepeatingSequence.length;

                if (earlierSequenceStartIndex >= 0) {
                    let earlierSequence = plan.path.slice(index - potentiallyRepeatingSequence.length, index);
                    if (_.isEqual(earlierSequence, potentiallyRepeatingSequence)) {
                        return callback(null, index);
                    }
                }

                index = plan.path.indexOf(plan.lastAction, index + 1);
            }
        }
        return callback(null, -1);
    },
    * backtrack(plan, savedPlans, index, callback) {
        let next = yield;
        let backtrackPlanFound = false;
        let backtrackPlan = null;
        let newSavedPlans = null;

        while (index > 0 && !backtrackPlanFound) {
            backtrackPlan = yield hillClimbing.emitAsync('hillClimbing.cloneSearchNode', savedPlans[index], next);
            let actions = new Set(backtrackPlan.actions);

            actions.delete(savedPlans[index + 1].lastAction);

            if (actions.size > 0) {
                newSavedPlans = savedPlans.slice(0, index + 1);
                backtrackPlan.actions = actions;
                savedPlans[index].actions = actions;
                backtrackPlanFound = true;
            }

            index--;
        }

        callback(null, {backtrackPlan, newSavedPlans});
    },
};

Emitter.mixIn(hillClimbing);

hillClimbing.runOn('hillClimbing.createPlans', hillClimbing.createPlans);
hillClimbing.runOn('hillClimbing.chooseAction', hillClimbing.chooseAction);
hillClimbing.on('hillClimbing.filterZeroActionCountActions', hillClimbing.filterZeroActionCountActions);
hillClimbing.on('hillClimbing.pruneExistingPlans', hillClimbing.pruneExistingPlans);
hillClimbing.on('hillClimbing.isDuplicate', hillClimbing.isDuplicate);
hillClimbing.on('hillClimbing.getActionWithSameComponent', hillClimbing.getActionWithSameComponent);
hillClimbing.on('hillClimbing.getLeastOccurringActionInPath', hillClimbing.getLeastOccurringActionInPath);
hillClimbing.on('hillClimbing.detectLoop', hillClimbing.detectLoop);
hillClimbing.on('hillClimbing.getMostOccurringAction', hillClimbing.getMostOccurringAction);
hillClimbing.runOn('hillClimbing.backtrack', hillClimbing.backtrack);
