'use strict';

const Emitter = require('../../util/emitter.js');
const setOperations = require('../../util/set-operations.js');
const _ = require('lodash');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const configHandler = require('../../util/config/config-handler.js');

let offlineReplanning;
module.exports = offlineReplanning = {
  _plans: [],
  _satisfiedActions: new Set(),
  _actionOccurrences: null,
  _savedPlans: null,
  _existingPlans: null,
  _discoveredActions: null,
  * replan(existingPlans, discoveredActions, options) {
    let next = yield;

    if (configHandler.get('debug')) {
      console.log('\nBeginning offline replanning\n');
    };

    offlineReplanning._existingPlans = existingPlans;
    offlineReplanning._discoveredActions = discoveredActions;
    let {actionOccurrences} = yield offlineReplanning.emitAsync(
        'countActions.calculate',
        offlineReplanning._existingPlans,
        offlineReplanning._discoveredActions,
        next
    );
    offlineReplanning._actionOccurrences = actionOccurrences;

    while (offlineReplanning._satisfiedActions.size < offlineReplanning._actionOccurrences.size) {
      offlineReplanning._savedPlans = [];
      let startNodes = yield offlineReplanning.emitAsync('startNodes.get', next);
      let plan = startNodes[0];
      while (
        plan.path.length < options.testLength &&
        offlineReplanning._satisfiedActions.size < offlineReplanning._actionOccurrences.size
      ) {
        let action = offlineReplanning._getAction(plan);
        if (action === null) {
          break;
        }
        plan.path.push(action);
        yield offlineReplanning.emitAsync('planner.applyEffects', plan, next);
        let {applicableActions} = yield offlineReplanning.emitAsync('possibleActions.get', plan, next);
        plan.actions = applicableActions;

        let backtrackPlan = yield offlineReplanning.emitAsync('offlineReplanning.checkForLoopAndBackTrack', plan, next);
        if (backtrackPlan !== null) {
          plan = backtrackPlan;
        } else if (!offlineReplanning._satisfiedActions.has(action)) {
          offlineReplanning._satisfiedActions.add(action);
          yield offlineReplanning.emitAsync('offlineReplanning.updateExistingPlansAndActionOccurrences', next);
        }
      }
      offlineReplanning._savePlan(plan);
    }

    offlineReplanning.emitAsync(
        'planner.planningFinished',
        offlineReplanning._plans,
        offlineReplanning._discoveredActions
    );
  },
  * _checkForLoopAndBackTrack(plan, callback) {
    let next = yield;

    let loopStartIndex = offlineReplanning._detectLoop(plan);
    if (loopStartIndex !== -1) {
      let {backtrackPlan, newSavedPlans} = yield offlineReplanning.emitAsync('offlineReplanning.backtrack',
          loopStartIndex,
          next);
      if (backtrackPlan !== null) {
        offlineReplanning._savedPlans = newSavedPlans;
        if (configHandler.get('debug')) {
          console.log(`Backtracked to: ${backtrackPlan.lastAction}`);
        }
        return callback(null, backtrackPlan);
      } else {
        return callback(
            new SimulatoError.PLANNER.FAILED_TO_BACKTRACK(
                'Unable to backtrack. No suitable backtrack point found'
            )
        );
      }
    } else {
      let copyOfPlan = yield offlineReplanning.emitAsync('searchNode.clone', plan, next);
      offlineReplanning._savedPlans.push(copyOfPlan);
    }

    return callback(null, null);
  },
  * _updateExistingPlansAndActionOccurrences(callback) {
    let next = yield;

    let prunedPlans = offlineReplanning._pruneExistingPlans();
    if (prunedPlans.length !== offlineReplanning._existingPlans.length) {
      offlineReplanning._existingPlans = prunedPlans;
      let {actionOccurrences} = yield offlineReplanning.emitAsync(
          'countActions.calculate',
          offlineReplanning._existingPlans,
          offlineReplanning._discoveredActions,
          next
      );
      offlineReplanning._actionOccurrences = actionOccurrences;
    }
    return callback();
  },
  _savePlan(plan) {
    let duplicate = offlineReplanning._isDuplicate(plan);
    if (duplicate) {
      throw new SimulatoError.PLANNER.DUPLICATE_PLAN_GENERATED(
          'A duplicate plan was detected. This should never happen in offline replanning'
      );
    }
    offlineReplanning._plans.push(plan);
    if (configHandler.get('debug')) {
      console.log(
          `Actions covered: ${offlineReplanning._satisfiedActions.size} / ` +
          `${offlineReplanning._discoveredActions.size}`
      );
    }
  },
  _getAction(plan) {
    if (plan.actions.has(plan.lastAction)) {
      plan.actions.delete(plan.lastAction);
    }
    if (plan.actions.size === 0) {
      if (plan.path.length > 0) {
        return null;
      } else {
        throw new SimulatoError.PLANNER.NO_STARTING_ACTIONS('No possible actions in starting state');
      }
    }
    let action = offlineReplanning._chooseAction(plan);
    if (action === null) {
      if (plan.path.length > 0) {
        return null;
      } else {
        throw new SimulatoError.PLANNER.NO_STARTING_ACTIONS('No possible actions in starting state');
      }
    }
    return action;
  },
  _pruneExistingPlans() {
    let prunedPlans = [];
    for (let plan of offlineReplanning._existingPlans) {
      let superset = setOperations.isSuperset(offlineReplanning._satisfiedActions, new Set(plan.path));
      if (!superset) {
        prunedPlans.push(plan);
      }
    }

    return prunedPlans;
  },
  _isDuplicate(plan) {
    for (let aPlan of offlineReplanning._plans) {
      if (setOperations.isEqual(aPlan.path, new Set(plan.path))) {
        return true;
      }
    }
    return false;
  },
  _chooseAction(plan) {
    let nonZeroActionCountActions = offlineReplanning._filterZeroActionCountActions(plan.actions);

    let unsatisfiedActions = setOperations.difference(nonZeroActionCountActions, offlineReplanning._satisfiedActions);
    let actionWithSameComponent = offlineReplanning._getActionWithSameComponent(plan, unsatisfiedActions);
    if (actionWithSameComponent) {
      return actionWithSameComponent;
    } else if (unsatisfiedActions.size > 0) {
      return [...unsatisfiedActions][0];
    }

    let unusedActions = setOperations.difference(nonZeroActionCountActions, new Set(plan.path));
    let mostOccurringUnusedAction = offlineReplanning._getMostOccurringAction(unusedActions);

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
  _getLeastOccurringActionInPath(plan, actions, actionOccurrencesInPath = new Map()) {
    for (let action of plan.path) {
      if (actions.has(action)) {
        if (actionOccurrencesInPath.has(action)) {
          let occurrences = actionOccurrencesInPath.get(action);
          actionOccurrencesInPath.set(action, ++occurrences);
        } else {
          actionOccurrencesInPath.set(action, 1);
        }
      }
    }

    let leastOccurringAction = null;

    if (actionOccurrencesInPath.size > 0) {
      leastOccurringAction = [...actionOccurrencesInPath][0][0];
      for (let [action, occurrences] of actionOccurrencesInPath.entries()) {
        if (occurrences <= actionOccurrencesInPath.get(leastOccurringAction)) {
          leastOccurringAction = action;
        }
      }
    }

    return leastOccurringAction;
  },
  _getActionWithSameComponent(plan, unsatisfiedActions) {
    if (plan.lastAction) {
      let lastActionComponent = plan.lastAction.split('.')[0];
      for (let unsatisfiedAction of unsatisfiedActions) {
        let unsatisfiedActionComponent = unsatisfiedAction.split('.')[0];
        if (lastActionComponent === unsatisfiedActionComponent) {
          return unsatisfiedAction;
        }
      }
    }
    return null;
  },
  _filterZeroActionCountActions(unusedActions) {
    let filteredActions = new Set();
    for (let unusedAction of unusedActions) {
      let actionCount = offlineReplanning._actionOccurrences.get(unusedAction);
      if (actionCount > 0) {
        filteredActions.add(unusedAction);
      }
    }
    return filteredActions;
  },
  _getMostOccurringAction(possibleActions) {
    let mostOccurringAction = null;
    for (let possibleAction of possibleActions) {
      let mostOccurringActionCount = offlineReplanning._actionOccurrences.get(mostOccurringAction) || 0;
      let occurrences = offlineReplanning._actionOccurrences.get(possibleAction);
      if (mostOccurringActionCount < occurrences) {
        mostOccurringAction = possibleAction;
      }
    }
    return mostOccurringAction;
  },
  _detectLoop(plan) {
    let indexOfRepeatingAction = plan.path.indexOf(plan.lastAction);
    if (indexOfRepeatingAction === plan.path.length -1 || indexOfRepeatingAction === -1) {
      return -1;
    } else {
      while (indexOfRepeatingAction !== -1 && indexOfRepeatingAction !== plan.path.length -1) {
        let potentiallyRepeatingSequence = plan.path.slice(indexOfRepeatingAction + 1, plan.path.length - 1);
        let earlierSequenceStartIndex = indexOfRepeatingAction - potentiallyRepeatingSequence.length;

        if (earlierSequenceStartIndex >= 0) {
          let earlierSequence = plan.path.slice(
              indexOfRepeatingAction - potentiallyRepeatingSequence.length,
              indexOfRepeatingAction
          );
          if (_.isEqual(earlierSequence, potentiallyRepeatingSequence)) {
            return indexOfRepeatingAction;
          }
        }

        indexOfRepeatingAction = plan.path.indexOf(plan.lastAction, indexOfRepeatingAction + 1);
      }
    }
    return -1;
  },
  * _backtrack(index, callback) {
    let next = yield;
    let backtrackPlan = null;
    let newSavedPlans = null;

    while (index >= 0) {
      backtrackPlan = yield offlineReplanning.emitAsync('searchNode.clone', offlineReplanning._savedPlans[index], next);
      let actions = new Set(backtrackPlan.actions);

      actions.delete(offlineReplanning._savedPlans[index + 1].lastAction);

      if (actions.size > 0) {
        newSavedPlans = offlineReplanning._savedPlans.slice(0, index + 1);
        backtrackPlan.actions = actions;
        offlineReplanning._savedPlans[index].actions = actions;
        return callback(null, {backtrackPlan, newSavedPlans});
      }

      index--;
    }

    return callback(null, {backtrackPlan: null, newSavedPlans: null});
  },
};

Emitter.mixIn(offlineReplanning, plannerEventDispatch);

offlineReplanning.runOn('offlineReplanning.backtrack', offlineReplanning._backtrack);
offlineReplanning.runOn(
    'offlineReplanning.updateExistingPlansAndActionOccurrences',
    offlineReplanning._updateExistingPlansAndActionOccurrences
);
offlineReplanning.runOn(
    'offlineReplanning.checkForLoopAndBackTrack',
    offlineReplanning._checkForLoopAndBackTrack
);
