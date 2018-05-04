'use strict';

module.exports = {
    calculate(plans, discoveredActions, callback) {
        let actionOccurences = new Map();
        for (let action of discoveredActions.values()) {
            actionOccurences.set(action, 0);
        }

        for (let plan of plans) {
            for (let action of plan.path) {
                let occurence = actionOccurences.get(action);
                actionOccurences.set(action, ++occurence);
            }
        }

        let actionsNotCovered = new Set();
        for (let [action, occurence] of actionOccurences) {
            if (occurence === 0) {
                actionsNotCovered.add(action);
            }
        }

        callback(null, actionOccurences);
    },
};
