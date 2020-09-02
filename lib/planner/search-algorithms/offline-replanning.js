'use strict';

const crypto = require('crypto');
const Emitter = require('../../util/emitter.js');
const setOperations = require('../../util/set-operations.js');
const _ = require('lodash');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const configHandler = require('../../util/config/config-handler.js');

let offlineReplanning;
module.exports = offlineReplanning = {
  _plans: [],
  _planHashes: new Map(),
  _satisfiedActions: new Set(),
  _actionOccurrences: null,
  _savedPlans: null,
  _existingPlans: null,
  _discoveredActions: null,
  _algorithm: null,
  _randomSeed: 25,
  * replan(existingPlans, discoveredActions, algorithm, options) {
    const next = yield;

    if (configHandler.get('debug')) {
      console.log('\nBeginning offline replanning\n');
    };

    if (configHandler.get('replanningSeed')) {
      offlineReplanning._randomSeed = configHandler.get('replanningSeed');
    }

    offlineReplanning._algorithm = algorithm;
    offlineReplanning._existingPlans = existingPlans;
    offlineReplanning._discoveredActions = discoveredActions;
    const {actionOccurrences} = yield offlineReplanning.emitAsync(
        'countActions.calculate',
        offlineReplanning._existingPlans,
        offlineReplanning._discoveredActions,
        offlineReplanning._algorithm,
        next,
    );
    offlineReplanning._actionOccurrences = actionOccurrences;

    while (offlineReplanning._satisfiedActions.size < offlineReplanning._actionOccurrences.size) {
      offlineReplanning._savedPlans = [];
      const startNodes = yield offlineReplanning.emitAsync('startNodes.get', next);
      let plan = startNodes[0];
      const newlySatisfiedActions = new Set();
      let looped = false;
      while (
        plan.path.length < options.testLength &&
        offlineReplanning._satisfiedActions.size < offlineReplanning._actionOccurrences.size
      ) {
        looped = true;
        const action = offlineReplanning._getAction(plan);
        if (action === null) {
          break;
        }
        plan.path.push(action);
        yield offlineReplanning.emitAsync('planner.applyEffects', plan, next);
        const {applicableActions} = yield offlineReplanning.emitAsync('possibleActions.get', plan.state, next);
        plan.actions = applicableActions;

        const backtrackPlan =
          yield offlineReplanning.emitAsync('offlineReplanning.checkForLoopAndBackTrack', plan, next);
        if (backtrackPlan !== null) {
          plan = backtrackPlan;
        } else if (!offlineReplanning._satisfiedActions.has(action)) {
          newlySatisfiedActions.add(action);
          offlineReplanning._satisfiedActions.add(action);
          yield offlineReplanning.emitAsync('offlineReplanning.updateExistingPlansAndActionOccurrences', next);
        } else {
          let duplicate = offlineReplanning._comparePlan(plan);
          while (duplicate !== undefined || offlineReplanning._isDuplicate(plan)) {
            const {backtrackPlan, newSavedPlans, removed} =
                yield offlineReplanning.emitAsync('offlineReplanning.backtrack',
                    offlineReplanning._savedPlans.length - 2, // last good plan
                    next);
            if (backtrackPlan !== null) {
              offlineReplanning._savedPlans = newSavedPlans;
              if (configHandler.get('debug')) {
                console.log(`Backtracked to: ${backtrackPlan.lastAction}`);
              }
              plan = backtrackPlan;

              for (const removedAction of removed) {
                if (newlySatisfiedActions.has(removedAction)) {
                  newlySatisfiedActions.delete(removedAction);
                  offlineReplanning._satisfiedActions.delete(removedAction);
                }
              }
            } else {
              throw new SimulatoError.PLANNER.FAILED_TO_BACKTRACK(
                  'Unable to backtrack. No suitable backtrack point found',
              );
            }
            duplicate = offlineReplanning._comparePlan(backtrackPlan);
          }
        }

        if (backtrackPlan === null && configHandler.get('debug')) {
          console.log(`Added the following action to the plan: ${action}`);
        }
      }

      if (plan.path.length === 0) {
        break;
      } else if (looped && newlySatisfiedActions.size === 0) {
        if (configHandler.get('debug')) {
          console.log('Retrying replanning for plan ' + offlineReplanning._plans.length);
        }
      } else {
        if (configHandler.get('debug')) {
          console.log('Newly Satisfied: ' + newlySatisfiedActions.size);
        }
        offlineReplanning._savePlan(plan);
      }
    }

    if (offlineReplanning._algorithm.toLowerCase() === 'actiontree') {
      const testCases = [];
      for (const plan of offlineReplanning._plans) {
        testCases.push(plan.testCase);
      }
      offlineReplanning.emitAsync(
          'planner.planningFinished',
          testCases,
          offlineReplanning._discoveredActions,
          offlineReplanning._algorithm,
      );
    } else {
      offlineReplanning.emitAsync(
          'planner.planningFinished',
          offlineReplanning._plans,
          offlineReplanning._discoveredActions,
          offlineReplanning._algorithm,
      );
    }
  },
  * _checkForLoopAndBackTrack(plan, callback) {
    const next = yield;

    const loopStartIndex = offlineReplanning._detectLoop(plan);
    if (loopStartIndex !== -1) {
      const {backtrackPlan, newSavedPlans} = yield offlineReplanning.emitAsync('offlineReplanning.backtrack',
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
                'Unable to backtrack. No suitable backtrack point found',
            ),
        );
      }
    } else {
      const copyOfPlan = yield offlineReplanning.emitAsync('searchNode.clone', plan, next);
      offlineReplanning._savedPlans.push(copyOfPlan);
    }

    return callback(null, null);
  },
  * _updateExistingPlansAndActionOccurrences(callback) {
    const next = yield;

    const prunedPlans = offlineReplanning._pruneExistingPlans();
    if (prunedPlans.length !== offlineReplanning._existingPlans.length) {
      offlineReplanning._existingPlans = prunedPlans;
      const {actionOccurrences} = yield offlineReplanning.emitAsync(
          'countActions.calculate',
          offlineReplanning._existingPlans,
          offlineReplanning._discoveredActions,
          offlineReplanning._algorithm,
          next,
      );
      offlineReplanning._actionOccurrences = actionOccurrences;
    }
    return callback();
  },
  _savePlan(plan) {
    const duplicate = offlineReplanning._isDuplicate(plan);
    if (duplicate) {
      throw new SimulatoError.PLANNER.DUPLICATE_PLAN_GENERATED(
          'A duplicate plan was detected. This should never happen in offline replanning',
      );
    }
    offlineReplanning._plans.push(plan);
    const hash = crypto.createHash('sha256');
    offlineReplanning._planHashes.set(hash.update(
        JSON.stringify(plan.path)).digest('base64'), offlineReplanning._plans.length - 1);
    if (configHandler.get('debug')) {
      console.log(
          `Actions covered: ${offlineReplanning._satisfiedActions.size} / ` +
          `${offlineReplanning._discoveredActions.size}`,
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
    const action = offlineReplanning._chooseAction(plan);
    if (action === null) {
      if (plan.path.length > 0) {
        return null;
      } else {
        // This will trigger if there are actions not covered, which, while a real problem
        // shouldn't stop plans from being created. The command line output will still catch
        // these issues and show the actions not covered.
        const err = new SimulatoError.PLANNER.NO_STARTING_ACTIONS('No possible actions in starting state');
        console.log(err);

        return null;
      }
    }
    return action;
  },
  _pruneExistingPlans() {
    const prunedPlans = [];
    for (const plan of offlineReplanning._existingPlans) {
      let superset;
      if (offlineReplanning._algorithm.toLowerCase() === 'actiontree') {
        // actionTree plans _are_ the path
        const fixedPlan = plan.map((action) => {
          return action.name;
        });
        const planset = new Set(fixedPlan);
        planset.delete(fixedPlan[0]);
        superset = setOperations.isSuperset(offlineReplanning._satisfiedActions, planset);
      } else { // forwardStateSpaceSearchHeuristic
        // forwardStateSpaceSearchHeuristic plans contain an object with the plan path
        superset = setOperations.isSuperset(offlineReplanning._satisfiedActions, new Set(plan.path));
      }

      if (!superset) {
        prunedPlans.push(plan);
      }
    }

    return prunedPlans;
  },
  _isDuplicate(plan) {
    for (const aPlan of offlineReplanning._plans) {
      if (setOperations.isEqual(new Set(aPlan.path), new Set(plan.path))) {
        return true;
      }
    }
    return false;
  },
  _chooseAction(plan) {
    const nonZeroActionCountActions = offlineReplanning._filterZeroActionCountActions(plan.actions);

    const unsatisfiedActions = setOperations.difference(nonZeroActionCountActions, offlineReplanning._satisfiedActions);

    const actionWithSameComponent = offlineReplanning._getActionWithSameComponent(plan, unsatisfiedActions);
    if (actionWithSameComponent) {
      return actionWithSameComponent;
    } else if (unsatisfiedActions.size > 0) {
      const actionIndex = Math.floor(offlineReplanning._random(0, unsatisfiedActions.size - 1));
      return [...unsatisfiedActions][actionIndex];
    }

    const unusedActions = setOperations.difference(nonZeroActionCountActions, new Set(plan.path));

    if (unusedActions.size > 0) {
      const actionIndex = Math.floor(offlineReplanning._random(0, unusedActions.size - 1));
      return [...unusedActions][actionIndex];
    }

    const leastOccurringActionInPath =
      offlineReplanning._getLeastOccurringActionInPath(plan, nonZeroActionCountActions);
    if (leastOccurringActionInPath) {
      return leastOccurringActionInPath;
    }

    return null;
  },
  _getLeastOccurringActionInPath(plan, actions, actionOccurrencesInPath = new Map()) {
    for (const action of plan.path) {
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
      for (const [action, occurrences] of actionOccurrencesInPath.entries()) {
        if (occurrences <= actionOccurrencesInPath.get(leastOccurringAction)) {
          leastOccurringAction = action;
        }
      }
    }

    return leastOccurringAction;
  },
  _getActionWithSameComponent(plan, unsatisfiedActions) {
    if (plan.lastAction) {
      const lastActionComponent = plan.lastAction.split('.')[0];
      for (const unsatisfiedAction of unsatisfiedActions) {
        const unsatisfiedActionComponent = unsatisfiedAction.split('.')[0];
        if (lastActionComponent === unsatisfiedActionComponent) {
          return unsatisfiedAction;
        }
      }
    }
    return null;
  },
  _filterZeroActionCountActions(unusedActions) {
    const filteredActions = new Set();
    for (const unusedAction of unusedActions) {
      const actionCount = offlineReplanning._actionOccurrences.get(unusedAction);
      if (actionCount > 0) {
        filteredActions.add(unusedAction);
      }
    }
    return filteredActions;
  },
  _getMostOccurringAction(possibleActions) {
    let mostOccurringAction = null;
    for (const possibleAction of possibleActions) {
      const mostOccurringActionCount = offlineReplanning._actionOccurrences.get(mostOccurringAction) || 0;
      const occurrences = offlineReplanning._actionOccurrences.get(possibleAction);
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
        const potentiallyRepeatingSequence = plan.path.slice(indexOfRepeatingAction + 1, plan.path.length - 1);
        const earlierSequenceStartIndex = indexOfRepeatingAction - potentiallyRepeatingSequence.length;

        if (earlierSequenceStartIndex >= 0) {
          const earlierSequence = plan.path.slice(
              indexOfRepeatingAction - potentiallyRepeatingSequence.length,
              indexOfRepeatingAction,
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
    const next = yield;
    let backtrackPlan = null;
    let newSavedPlans = null;
    const removed = [];
    while (index >= 0) {
      backtrackPlan = yield offlineReplanning.emitAsync('searchNode.clone',
          offlineReplanning._savedPlans[index], next); // TODO: Potentially no need to clone—future improvement?
      const actions = new Set(backtrackPlan.actions);

      removed.push(offlineReplanning._savedPlans[index + 1].lastAction);
      actions.delete(removed[removed.length - 1]);

      if (actions.size > 0) {
        newSavedPlans = offlineReplanning._savedPlans.slice(0, index + 1);
        backtrackPlan.actions = actions;
        offlineReplanning._savedPlans[index].actions = actions;
        return callback(null, {backtrackPlan, newSavedPlans, removed});
      }

      index--;
    }

    return callback(null, {backtrackPlan: null, newSavedPlans: null});
  },
  _comparePlan(plan) {
    const hash = crypto.createHash('sha256');
    const planString = JSON.stringify(plan.path);
    const planHashDigest = hash.update(planString).digest('base64');

    return offlineReplanning._planHashes.get(planHashDigest);
  },
  _random(min, max) {
    max = max ? max : 1;
    min = min ? min : 0;
    offlineReplanning._randomSeed = (offlineReplanning._randomSeed * 9301 + 49297) % 233280;
    const rand = offlineReplanning._randomSeed / 233280;

    return min + rand * (max - min);
  },
};

Emitter.mixIn(offlineReplanning, plannerEventDispatch);

offlineReplanning.runOn('offlineReplanning.backtrack', offlineReplanning._backtrack);
offlineReplanning.runOn(
    'offlineReplanning.updateExistingPlansAndActionOccurrences',
    offlineReplanning._updateExistingPlansAndActionOccurrences,
);
offlineReplanning.runOn(
    'offlineReplanning.checkForLoopAndBackTrack',
    offlineReplanning._checkForLoopAndBackTrack,
);
