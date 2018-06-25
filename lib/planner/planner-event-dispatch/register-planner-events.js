'use strict';

const actionCoverage = require('../action-coverage.js');
const testPlanner = require('../test-planner.js');
const writePlansToDisk = require('../write-plans-to-disk.js');
const searchNode = require('../search-node.js');
const forwardStateSpaceSearch = require('../search-algorithms/forward-state-space-search-heuristic.js');
const reduceToMinimumSetOfPlans = require('../reduce-to-minimum-set-of-plans.js');
const possibleActions = require('../possible-actions.js');
const applyEffects = require('../apply-effects.js');
const startNodes = require('../start-nodes.js');

module.exports = function(plannerEventDispatch) {
    plannerEventDispatch.on('planner.generateConfigured', testPlanner.generateTests);

    plannerEventDispatch.runOn('testPlanner.createPlans', forwardStateSpaceSearch.createPlans);
    plannerEventDispatch.on('testPlanner.reduceToMinimumSetOfPlans', reduceToMinimumSetOfPlans);
    plannerEventDispatch.on('testPlanner.planningFinished', writePlansToDisk);
    plannerEventDispatch.on('testPlanner.planningFinished', actionCoverage.calculate);

    plannerEventDispatch.on('forwardStateSpaceSearch.cloneSearchNode', searchNode.clone);
    plannerEventDispatch.on('forwardStateSpaceSearch.applyEffects', applyEffects);

    plannerEventDispatch.runOn('startNodes.get', startNodes.get);

    plannerEventDispatch.on('searchNode.create', searchNode.create);

    plannerEventDispatch.runOn('possibleActions.get', possibleActions.get);
};
