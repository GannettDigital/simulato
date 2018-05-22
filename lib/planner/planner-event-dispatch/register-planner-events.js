'use strict';

const actionCoverage = require('../action-coverage.js');
const testPlanner = require('../test-planner.js');
const writePlansToDisk = require('../write-plans-to-disk.js');
const searchNode = require('../search-node.js');
const forwardStateSpaceSearch = require('../search-algorithms/forward-state-space-search-heuristic.js');
const actionFocusedTechnique = require('../test-generatorion-techniques/action-focused-technique.js');
const hillClimbing = require('../search-algorithms/hill-climbing.js');
const countActions = require('../count-actions.js');
const possibleActions = require('../possible-actions.js');
const applyEffects = require('../apply-effects.js');

module.exports = function(plannerEventDispatch) {
    plannerEventDispatch.on('planner.generateConfigured', testPlanner.generateTests);

    testPlanner.on('testPlanner.actionFocusedTechniqueSet', actionFocusedTechnique.determineActions);

    actionFocusedTechnique.on('actionFocusedTechnique.planningFinished', function(...parameters) {
        hillClimbing.emit('hillClimbing.createPlans', ...parameters);
    });
    actionFocusedTechnique.on('actionFocusedTechnique.createSearchNode', searchNode.create);
    actionFocusedTechnique
        .on('actionFocusedTechnique.createPlans', function(entryComponents, predeterminedGoalAction, callback) {
            forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.createPlans', entryComponents, predeterminedGoalAction, callback);
    });

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

    forwardStateSpaceSearch.on('forwardStateSpaceSearch.runAssertions',
        function(pageState, dataStore, preconditions, callback) {
            process.nextTick(function() {
                plannerEventDispatch.emit('planner.runAssertions', pageState, dataStore, preconditions, callback);
            });
        }
    );

    searchNode.on('searchNode.createExpectedState', function(dataStore, callback) {
        plannerEventDispatch.emit('planner.createExpectedState', dataStore, callback);
    });

    searchNode.on('searchNode.createDataStore', function(callback) {
        plannerEventDispatch.emit('planner.createDataStore', callback);
    });

    hillClimbing.on('hillClimbing.calculateActionCounts', function(...parameters) {
        process.nextTick(function() {
            countActions.calculate(...parameters);
        });
    });

    hillClimbing.on('hillClimbing.createSearchNode', function(actions, callback) {
        process.nextTick(function() {
            searchNode.create(actions, callback);
        });
    });

    hillClimbing.on('hillClimbing.getComponents', function(callback) {
        process.nextTick(function() {
            plannerEventDispatch.emit('planner.getComponents', callback);
        });
    });

    hillClimbing.on('hillClimbing.getPossibleActions', function(...parameters) {
        process.nextTick(function() {
            possibleActions.emit('possibleActions.getPossibleActions', ...parameters);
        });
    });

    hillClimbing.on('hillClimbing.cloneSearchNode', searchNode.clone);

    hillClimbing.on('hillClimbing.applyEffects', applyEffects);
    hillClimbing.on('hillClimbing.planningFinished', writePlansToDisk);
    hillClimbing.on('hillClimbing.planningFinished', actionCoverage.calculate);


    possibleActions.on('possibleActions.runAssertions', function(state, preconditions, callback) {
        process.nextTick(function() {
            plannerEventDispatch.emit('planner.runAssertions', state, preconditions, callback);
        });
    });
};
