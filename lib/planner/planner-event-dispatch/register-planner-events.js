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

    testPlanner.on('testPlanner.createPlans', function(predeterminedGoalAction, callback) {
        forwardStateSpaceSearch
            .emit('forwardStateSpaceSearch.createPlans', predeterminedGoalAction, callback);
    });
    testPlanner.on('testPlanner.reduceToMinimumSetOfPlans', reduceToMinimumSetOfPlans);
    testPlanner.on('testPlanner.planningFinished', writePlansToDisk);
    testPlanner.on('testPlanner.planningFinished', actionCoverage.calculate);

    actionCoverage.on('actionCoverage.getComponentActions', function(callback) {
        plannerEventDispatch.emit('planner.getComponentActions', callback);
    });

    possibleActions.on('possibleActions.runAssertions', function(state, dataStore, preconditions, callback) {
        process.nextTick(function() {
            plannerEventDispatch.emit('planner.runAssertions', state, dataStore, preconditions, callback);
        });
    });

    forwardStateSpaceSearch.on('forwardStateSpaceSearch.cloneSearchNode', searchNode.clone);
    forwardStateSpaceSearch.on('forwardStateSpaceSearch.runAssertions',
        function(pageState, dataStore, preconditions, callback) {
            plannerEventDispatch.emit('planner.runAssertions', pageState, dataStore, preconditions, callback);
        }
    );
    forwardStateSpaceSearch.on('forwardStateSpaceSearch.getPossibleActions', function(...parameters) {
        possibleActions.emit('possibleActions.get', ...parameters);
    });
    forwardStateSpaceSearch.on('forwardStateSpaceSearch.applyEffects', applyEffects);
    forwardStateSpaceSearch.on('forwardStateSpaceSearch.getStartNodes', function(...parameters) {
        startNodes.emit('startNodes.get', ...parameters);
    });

    startNodes.on('startNodes.createSearchNode', searchNode.create);
    startNodes.on('startNodes.getComponents', function(callback) {
        plannerEventDispatch.emit('planner.getComponents', callback);
    });
    startNodes.on('startNodes.getPossibleActions', function(...parameters) {
        possibleActions.emit('possibleActions.get', ...parameters);
    });

    searchNode.on('searchNode.createExpectedState', function(dataStore, callback) {
        plannerEventDispatch.emit('planner.createExpectedState', dataStore, callback);
    });
    searchNode.on('searchNode.createDataStore', function(callback) {
        plannerEventDispatch.emit('planner.createDataStore', callback);
    });
};
