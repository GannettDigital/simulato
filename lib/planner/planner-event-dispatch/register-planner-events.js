'use strict';

const actionCoverage = require('../action-coverage.js');
const testPlanner = require('../test-planner.js');
const writePlansToDisk = require('../write-plans-to-disk.js');
const searchNode = require('../search-node.js');
const forwardStateSpaceSearch = require('../search-algorithms/forward-state-space-search-heuristic.js');
const actionFocusedTechnique = require('../test-generatorion-techniques/action-focused-technique.js');
const possibleActions = require('../possible-actions.js');
const applyEffects = require('../apply-effects.js');
const startNodes = require('../start-nodes.js');

module.exports = function(plannerEventDispatch) {
    plannerEventDispatch.on('planner.generateConfigured', testPlanner.generateTests);

    plannerEventDispatch.on('testPlanner.actionFocusedTechniqueSet', actionFocusedTechnique.createPlans);

    plannerEventDispatch.on('actionFocusedTechnique.planningFinished', writePlansToDisk);
    plannerEventDispatch.on('actionFocusedTechnique.createSearchNode', searchNode.create);
    plannerEventDispatch
        .on('actionFocusedTechnique.createPlans', function(entryComponents, predeterminedGoalAction, callback) {
            forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.createPlans', entryComponents, callback);
    });

    plannerEventDispatch.on('actionFocusedTechnique.planningFinished', actionCoverage.calculate);
    plannerEventDispatch.on('actionFocusedTechnique.getComponentActions', function(callback) {
        plannerEventDispatch.emit('planner.getComponentActions', callback);
    });

    plannerEventDispatch.on('forwardStateSpaceSearch.cloneSearchNode', searchNode.clone);
    plannerEventDispatch.on('forwardStateSpaceSearch.applyEffects', applyEffects);

    plannerEventDispatch.runOn('startNodes.get', startNodes.get);
    plannerEventDispatch.on('startNodes.createSearchNode', searchNode.create);

    plannerEventDispatch.runOn('possibleActions.get', possibleActions.get);
};
