'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/planner-event-dispatch/register-planner-events.js', function() {
    let actionCoverage;
    let testPlanner;
    let writePlansToDisk;
    let searchNode;
    let forwardStateSpaceSearch;
    let reduceToMinimumSetOfPlans;
    let possibleActions;
    let applyEffects;
    let startNodes;
    let registerPlannerEvents;
    let plannerEventDispatch;

    beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/planner/planner-event-dispatch/register-planner-events.js');

    actionCoverage = {
        calculate: sinon.stub(),
    };
    testPlanner = {
        generateTests: sinon.stub(),
    };
    writePlansToDisk = sinon.stub();
    searchNode = {
        create: sinon.stub(),
    };
    forwardStateSpaceSearch = {
        createPlans: sinon.stub(),
    };
    reduceToMinimumSetOfPlans = sinon.stub();
    possibleActions = {
        get: sinon.stub(),
    };
    applyEffects = sinon.stub();
    startNodes = {
        get: sinon.stub(),
    };
    plannerEventDispatch = {
        on: sinon.stub(),
        runOn: sinon.stub(),
    };

    mockery.registerMock('../action-coverage.js', actionCoverage);
    mockery.registerMock('../test-planner.js', testPlanner);
    mockery.registerMock('../write-plans-to-disk.js', writePlansToDisk);
    mockery.registerMock('../search-node.js', searchNode);
    mockery.registerMock('../search-algorithms/forward-state-space-search-heuristic.js', forwardStateSpaceSearch);
    mockery.registerMock('../reduce-to-minimum-set-of-plans.js', reduceToMinimumSetOfPlans);
    mockery.registerMock('../possible-actions.js', possibleActions);
    mockery.registerMock('../apply-effects.js', applyEffects);
    mockery.registerMock('../start-nodes.js', startNodes);

    registerPlannerEvents =
        require('../../../../../lib/planner/planner-event-dispatch/register-planner-events.js');
    });

    afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
    });

    it('should call plannerEventDispatch.on 7 times', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.callCount).to.equal(7);
    });

    it('should call plannerEventDispatch.runOn 3 times', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.runOn.callCount).to.equal(3);
    });

    it('should call plannerEventDispatch.on with the event \'planner.generateConfigured\' ' +
        'and testPlanner.generateTests as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[0]).to.deep.equal([
            'planner.generateConfigured',
            testPlanner.generateTests,
        ]);
    });

    it('should call plannerEventDispatch.runOn with the event \'testPlanner.createPlans\' ' +
        'and  as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.runOn.args[0]).to.deep.equal([
            'testPlanner.createPlans',
            forwardStateSpaceSearch.createPlans,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'testPlanner.reduceToMinimumSetOfPlans\' ' +
        'and reduceToMinimumSetOfPlans as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[1]).to.deep.equal([
            'testPlanner.reduceToMinimumSetOfPlans',
            reduceToMinimumSetOfPlans,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'testPlanner.planningFinished\' ' +
        'and writePlansToDisk as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[2]).to.deep.equal([
            'testPlanner.planningFinished',
            writePlansToDisk,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'testPlanner.planningFinished\' ' +
        'and  as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[3]).to.deep.equal([
            'testPlanner.planningFinished',
            actionCoverage.calculate,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'forwardStateSpaceSearch.cloneSearchNode\' ' +
        'and searchNode.clone as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[4]).to.deep.equal([
            'forwardStateSpaceSearch.cloneSearchNode',
            searchNode.clone,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'forwardStateSpaceSearch.applyEffects\' ' +
        'and applyEffects as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[5]).to.deep.equal([
            'forwardStateSpaceSearch.applyEffects',
            applyEffects,
        ]);
    });

    it('should call plannerEventDispatch.runOn with the event \'startNodes.get\' ' +
        'and startNodes.get as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.runOn.args[1]).to.deep.equal([
            'startNodes.get',
            startNodes.get,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'searchNode.create\' ' +
        'and searchNode.create as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.on.args[6]).to.deep.equal([
            'searchNode.create',
            searchNode.create,
        ]);
    });

    it('should call plannerEventDispatch.runOn with the event \'possibleActions.get\' ' +
        'and possibleActions.get as parameter', function() {
        registerPlannerEvents(plannerEventDispatch);

        expect(plannerEventDispatch.runOn.args[2]).to.deep.equal([
            'possibleActions.get',
            possibleActions.get,
        ]);
    });
});
