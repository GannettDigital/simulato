'use strict';

module.exports = {
  calculate(plans, discoveredActions, callback) {
    let actionOccurrences = new Map();
    for (let action of discoveredActions.values()) {
      actionOccurrences.set(action, 0);
    }

    for (let plan of plans) {
      for (let action of plan.path) {
        let occurence = actionOccurrences.get(action);
        actionOccurrences.set(action, ++occurence);
      }
    }

    let actionsNotCovered = new Set();
    for (let [action, occurence] of actionOccurrences) {
      if (occurence === 0) {
        actionsNotCovered.add(action);
      }
    }

    callback(null, {
      actionOccurrences,
      actionsNotCovered,
    });
  },
};
