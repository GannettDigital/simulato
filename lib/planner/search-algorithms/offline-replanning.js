'use strict';

const Emitter = require('../../util/emitter.js');
const setOperations = require('../../util/set-operations.js');
const _ = require('lodash');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const configHandler = require('../../util/config/config-handler.js');

let offlineReplanning;
module.exports = offlineReplanning = {
  * replan(existingPlans, discoveredActions, options, callback) {
    let next = yield;

    let plans = [];
    let satisfiedActions = new Set();
    let actionCounts = yield offlineReplanning.emitAsync(
        'offlineReplanning.calculateActionCounts',
        existingPlans,
        discoveredActions,
        next
    );

    while (satisfiedActions.size < actionCounts.size) {
      let savedPlans = [];
      let startNodes = yield offlineReplanning.emitAsync('startNodes.get', next);
      let plan = startNodes[0];
      while (plan.path.length < options.testLength && satisfiedActions.size < actionCounts.size) {
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
        let action = offlineReplanning._chooseAction(plan, actionCounts, satisfiedActions);
        if (action === null) {
          if (plan.path.length > 0) {
            break;
          } else {
            throw new Error('No possible actions in starting state');
          }
        }
        plan.path.push(action);
        yield offlineReplanning.emitAsync('planner.applyEffects', plan, next);
        let {applicableActions} = yield offlineReplanning.emitAsync('possibleActions.get', plan, next);
        plan.actions = applicableActions;

        satisfiedActions.add(action);
        let prunedPlans = offlineReplanning._pruneExistingPlans(existingPlans, satisfiedActions);
        if (prunedPlans.length !== existingPlans.length) {
          existingPlans = prunedPlans;
          actionCounts = yield offlineReplanning.emitAsync(
              'offlineReplanning.calculateActionCounts',
              existingPlans,
              discoveredActions,
              next
          );
        }
        let loopStartIndex = offlineReplanning._detectLoop(plan);
        if (loopStartIndex !== -1) {
          let {backtrackPlan, newSavedPlans} = yield offlineReplanning.emitAsync('offlineReplanning.backtrack',
              savedPlans,
              loopStartIndex,
              next);
          if (backtrackPlan !== null) {
            plan = backtrackPlan;
            savedPlans = newSavedPlans;
            if (configHandler.get('debug')) {
              console.log('I have backtracked');
            }
          } else {
            throw new Error('Unable to backtrack!');
          }
        } else {
          let copyOfPlan = yield offlineReplanning.emitAsync('searchNode.clone', plan, next);
          savedPlans.push(copyOfPlan);
        }
      }
      let duplicate = offlineReplanning._isDuplicate(plans, plan);
      if (duplicate) {
        throw new Error('Generated a duplicate plan!');
      }
      plans.push(plan);
      if (configHandler.get('debug')) {
        console.log('Satisfied actions size:');
        console.log(satisfiedActions.size);
      }
    }

    offlineReplanning.emitAsync('planner.planningFinished', plans, discoveredActions);
  },
  _pruneExistingPlans(existingPlans, satisfiedActions) {
    let prunedPlans = [];
    for (let plan of existingPlans) {
      let superset = setOperations.isSuperset(satisfiedActions, new Set(plan.path));
      if (!superset) {
        prunedPlans.push(plan);
      }
    }

    return prunedPlans;
  },
  _isDuplicate(plans, plan) {
    for (let aPlan of plans) {
      if (setOperations.isEqual(aPlan.path, new Set(plan.path))) {
        return true;
      }
    }
    return false;
  },
  _chooseAction(plan, actionCounts, satisfiedActions) {
    let nonZeroActionCountActions = offlineReplanning._filterZeroActionCountActions(plan.actions, actionCounts);

    let unsatisfiedActions = setOperations.difference(nonZeroActionCountActions, satisfiedActions);
    let actionWithSameComponent = offlineReplanning._getActionWithSameComponent(plan, unsatisfiedActions);
    if (actionWithSameComponent) {
      return actionWithSameComponent;
    } else if (unsatisfiedActions.size > 0) {
      return [...unsatisfiedActions][0];
    }

    let unusedActions = setOperations.difference(nonZeroActionCountActions, new Set(plan.path));
    let mostOccurringUnusedAction = offlineReplanning._getMostOccurringAction(unusedActions, actionCounts);

    if (mostOccurringUnusedAction) {
      return mostOccurringUnusedAction;
    } else if (unusedActions.size > 0) {
      return [...unusedActions][0];
    }

    let leastOccurringActionInPath = offlineReplanning._getLeastOccurringActionInPath(plan, nonZeroActionCountActions);
    if (leastOccurringActionInPath) {
      return leastOccurringActionInPath;
    }

    return null;
  },
  _getLeastOccurringActionInPath(plan, actions) {
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

    return leastOccurringAction;
  },
  _getActionWithSameComponent(plan, unsatisfiedActions) {
    if (plan.lastAction) {
      let lastActionComponent = plan.lastAction.split('.')[0];
      for (let action of unsatisfiedActions) {
        let unsatisfiedActionComponent = action.split('.')[0];
        if (lastActionComponent === unsatisfiedActionComponent) {
          return action;
        }
      }
    }
    return null;
  },
  _filterZeroActionCountActions(unusedActions, actionCounts) {
    let filteredActions = new Set();
    for (let action of unusedActions) {
      let actionCount = actionCounts.get(action);
      if (actionCount > 0 ) {
        filteredActions.add(action);
      }
    }
    return filteredActions;
  },
  _getMostOccurringAction(possibleActions, actionCounts) {
    let mostOccurringAction = null;
    for (let action of possibleActions) {
      let mostOccurringActionCount = actionCounts.get(mostOccurringAction) || 0;
      let occurrences = actionCounts.get(action);
      if (mostOccurringActionCount < occurrences) {
        mostOccurringAction = action;
      }
    }
    return mostOccurringAction;
  },
  _detectLoop(plan) {
    let index = plan.path.indexOf(plan.lastAction);
    if (index === plan.path.length -1 || index === -1) {
      return -1;
    } else {
      while (index !== -1 && index !== plan.path.length -1) {
        let potentiallyRepeatingSequence = plan.path.slice(index + 1, plan.path.length - 1);
        let earlierSequenceStartIndex = index - potentiallyRepeatingSequence.length;

        if (earlierSequenceStartIndex >= 0) {
          let earlierSequence = plan.path.slice(index - potentiallyRepeatingSequence.length, index);
          if (_.isEqual(earlierSequence, potentiallyRepeatingSequence)) {
            return index;
          }
        }

        index = plan.path.indexOf(plan.lastAction, index + 1);
      }
    }
    return -1;
  },
  * _backtrack(savedPlans, index, callback) {
    let next = yield;
    let backtrackPlanFound = false;
    let backtrackPlan = null;
    let newSavedPlans = null;

    while (index > 0 && !backtrackPlanFound) {
      backtrackPlan = yield offlineReplanning.emitAsync('searchNode.clone', savedPlans[index], next);
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

Emitter.mixIn(offlineReplanning, plannerEventDispatch);

offlineReplanning.runOn('offlineReplanning.backtrack', offlineReplanning._backtrack);
