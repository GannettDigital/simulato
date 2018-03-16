'use strict';

const actionCoverage = require('../action-coverage.js');
const testPlanner = require('../test-planner.js');
const writePlansToDisk = require('../write-plans-to-disk.js');
const searchNode = require('../search-node.js');
const forwardStateSpaceSearch = require('../search-algorithms/forward-state-space-search-heuristic.js');
const actionFocusedTechnique = require('../test-generatorion-techniques/action-focused-technique.js');

module.exports = function(plannerEventDispatch) {
    plannerEventDispatch.on('planner.generateConfigured', testPlanner.generateTests);

    testPlanner.on('testPlanner.actionFocusedTechniqueSet', actionFocusedTechnique.determineActions);

    actionFocusedTechnique.on('actionFocusedTechnique.planningFinished', writePlansToDisk);
    actionFocusedTechnique.on('actionFocusedTechnique.createSearchNode', searchNode.create);
    actionFocusedTechnique
        .on('actionFocusedTechnique.createPlans', function(entryComponents, predeterminedGoalAction, callback) {
            forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.createPlans', entryComponents, predeterminedGoalAction, callback);
    });
    actionFocusedTechnique.on('actionFocusedTechnique.planningFinished', actionCoverage.calculate);
    actionFocusedTechnique.on('actionFocusedTechnique.getComponents', function(callback) {
        plannerEventDispatch.emit('planner.getComponents', callback);
    });

    forwardStateSpaceSearch.on('forwardStateSpaceSearch.createSearchNode', function(actions, callback) {
        process.nextTick(function() {
            searchNode.create(actions, callback);
        });
    });
    forwardStateSpaceSearch.on('forwardStateSpaceSearch.cloneSearchNode', function(node, callback) {
        process.nextTick(function() {
            searchNode.clone(node, callback);
        });
    });

    actionCoverage.on('actionCoverage.getComponentActions', function(callback) {
        plannerEventDispatch.emit('planner.getComponentActions', callback);
    });

    actionFocusedTechnique.on('actionFocusedTechnique.getComponentActions', function(callback) {
        plannerEventDispatch.emit('planner.getComponentActions', callback);
    });

    forwardStateSpaceSearch.on('forwardStateSpaceSearch.getComponents', function(callback) {
        process.nextTick(function() {
            plannerEventDispatch.emit('planner.getComponents', callback);
        });
    });

    forwardStateSpaceSearch.on('forwardStateSpaceSearch.runAssertions', function(state, preconditions, callback) {
        process.nextTick(function() {
            plannerEventDispatch.emit('planner.runAssertions', state, preconditions, callback);
        });
    });

    searchNode.on('searchNode.createExpectedState', function(callback) {
        plannerEventDispatch.emit('planner.createExpectedState', callback);
    });
};