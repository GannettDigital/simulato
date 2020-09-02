'use strict';

module.exports = {
  calculate(plans, discoveredActions, algorithm, callback) {
    const actionOccurrences = new Map();
    for (const action of discoveredActions.values()) {
      actionOccurrences.set(action, 0);
    }

    switch (algorithm) {
      case 'actionTree':
        module.exports._countActionTree(actionOccurrences, plans);
        break;
      default:
        module.exports._countDefault(actionOccurrences, plans);
    }

    const actionsNotCovered = new Set();
    for (const [action, occurence] of actionOccurrences) {
      if (occurence === 0) {
        actionsNotCovered.add(action);
      }
    }

    callback(null, {
      actionOccurrences,
      actionsNotCovered,
    });
  },
  _countActionTree(actionOccurrences, plans) {
    for (const plan of plans) {
      for (const action of plan) {
        if (!action.type) {
          let occurence = actionOccurrences.get(action.name);
          actionOccurrences.set(action.name, ++occurence);
        }
      }
    }
  },
  _countDefault(actionOccurrences, plans) {
    for (const plan of plans) {
      for (const action of plan.path) {
        if (!action.type) {
          let occurence = actionOccurrences.get(action);
          actionOccurrences.set(action, ++occurence);
        }
      }
    }
  },
};
