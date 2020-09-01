'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let actionCoverage;
module.exports = actionCoverage = {
  * reportCoverage(plans, discoveredActions, algorithm) {
    const next = yield;

    const {actionOccurrences, actionsNotCovered} = yield actionCoverage.emitAsync(
        'countActions.calculate',
        plans,
        discoveredActions,
        algorithm,
        next,
    );

    console.log(`\n-- Action Coverage Report --`);

    console.log(`\nAction Occurrences`);
    for (const [action, occurences] of actionOccurrences) {
      console.log(`\t${action}: ${occurences}`);
    }

    if (actionsNotCovered.size > 0) {
      console.log(`\nActions Not Covered: ${actionsNotCovered.size}`);
      for (const action of actionsNotCovered) {
        console.log(`\t${action}`);
      }
    }

    const numberOfActionsCovered = actionOccurrences.size - actionsNotCovered.size;
    const coveragePercentage = (100 - (actionsNotCovered.size / actionOccurrences.size) * 100).toPrecision(5);

    console.log(`\nAction Coverage: ${numberOfActionsCovered} / ${actionOccurrences.size}`);
    console.log(`\nAction Coverage Percentage: ${coveragePercentage}%`);
  },
};

Emitter.mixIn(actionCoverage, plannerEventDispatch);

