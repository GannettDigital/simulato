'use strict';

const Emitter = require('../util/emitter.js');

let actionCoverage;
module.exports = actionCoverage = {
    calculate(plans, discoveredActions) {
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

        actionCoverage.emit('actionCoverage.coverageCalculated', actionOccurences, actionsNotCovered);
    },
    _reportCoverage(actionOccurences, actionsNotCovered) {
        console.log(`\n-- Action Coverage Report --`);

        console.log(`\nAction Occurences`);
        for (let [action, occurences] of actionOccurences) {
            console.log(`\t${action}: ${occurences}`);
        }

        if (actionsNotCovered.size > 0) {
            console.log(`\nActions Not Covered: ${actionsNotCovered.size}`);
            for (let action of actionsNotCovered) {
                console.log(`\t${action}`);
            }
        }

        let numberOfActionsCovered = actionOccurences.size - actionsNotCovered.size;
        let coveragePercentage = (100 - (actionsNotCovered.size / actionOccurences.size) * 100).toPrecision(5);
        console.log(`\nAction Coverage: ${numberOfActionsCovered} / ${actionOccurences.size}`);
        console.log(`\nAction Coverage Percentage: ${coveragePercentage}%`);
    },
};

Emitter.mixIn(actionCoverage, require('./planner-event-dispatch/planner-event-dispatch.js'));

actionCoverage.on('actionCoverage.coverageCalculated', actionCoverage._reportCoverage);
