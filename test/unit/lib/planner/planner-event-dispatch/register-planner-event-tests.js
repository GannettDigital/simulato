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
  let countActions;
  let reduceToMinimumSetOfPlans;
  let possibleActions;
  let applyEffects;
  let startNodes;
  let registerPlannerEvents;
  let offlineReplanning;
  let plannerEventDispatch;
  let actionTree;
  let entryComponents;
  let stateDifference;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/planner/planner-event-dispatch/register-planner-events.js');

    actionCoverage = {
      reportCoverage: sinon.stub(),
    };
    testPlanner = {
      generateTests: sinon.stub(),
    };
    writePlansToDisk = sinon.stub();
    searchNode = {
      create: sinon.stub(),
      clone: sinon.stub(),
    };
    forwardStateSpaceSearch = {
      createPlans: sinon.stub(),
    };
    countActions = {
      calculate: sinon.stub(),
    };
    reduceToMinimumSetOfPlans = sinon.stub();
    possibleActions = {
      get: sinon.stub(),
    };
    applyEffects = sinon.stub();
    startNodes = {
      get: sinon.stub(),
    };
    offlineReplanning = {
      replan: sinon.stub(),
    };
    plannerEventDispatch = {
      on: sinon.stub(),
      runOn: sinon.stub(),
    };
    actionTree = {
      createPlans: sinon.stub(),
    };
    entryComponents = {
      get: sinon.stub(),
    };
    stateDifference = {
      createDiff: sinon.stub(),
    };

    mockery.registerMock('../action-coverage.js', actionCoverage);
    mockery.registerMock('../test-planner.js', testPlanner);
    mockery.registerMock('../write-plans-to-disk.js', writePlansToDisk);
    mockery.registerMock('../search-node.js', searchNode);
    mockery.registerMock('../search-algorithms/forward-state-space-search-heuristic.js', forwardStateSpaceSearch);
    mockery.registerMock('../search-algorithms/offline-replanning.js', offlineReplanning);
    mockery.registerMock('../count-actions.js', countActions);
    mockery.registerMock('../reduce-to-minimum-set-of-plans.js', reduceToMinimumSetOfPlans);
    mockery.registerMock('../possible-actions.js', possibleActions);
    mockery.registerMock('../apply-effects.js', applyEffects);
    mockery.registerMock('../start-nodes.js', startNodes);
    mockery.registerMock('../search-algorithms/action-tree.js', actionTree);
    mockery.registerMock('../entry-components.js', entryComponents);
    mockery.registerMock('../state-difference.js', stateDifference);


    registerPlannerEvents =
      require('../../../../../lib/planner/planner-event-dispatch/register-planner-events.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call plannerEventDispatch.on 8 times', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.callCount).to.equal(8);
  });

  it('should call plannerEventDispatch.runOn 8 times', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.callCount).to.equal(8);
  });

  it('should call plannerEventDispatch.on with the event \'planner.generateConfigured\' ' +
    'and testPlanner.generateTests as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[0]).to.deep.equal([
      'planner.generateConfigured',
      testPlanner.generateTests,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'testPlanner.createActionTreePlans\' ' +
    'and  as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[0]).to.deep.equal([
      'testPlanner.createActionTreePlans',
      actionTree.createPlans,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event' +
    '\testPlanner.createForwardStateSpaceSearchHeuristicPlans\' ' +
    'and  as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[1]).to.deep.equal([
      'testPlanner.createForwardStateSpaceSearchHeuristicPlans',
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

  it('should call plannerEventDispatch.on with the event \'planner.planningFinished\' ' +
    'and writePlansToDisk as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[2]).to.deep.equal([
      'planner.planningFinished',
      writePlansToDisk,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'planner.planningFinished\' ' +
    'and actionCoverage.reportCoverage as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[2]).to.deep.equal([
      'planner.planningFinished',
      actionCoverage.reportCoverage,
    ]);
  });

  it('should call plannerEventDispatch.on with the event \'planner.applyEffects\' ' +
    'and applyEffects as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[3]).to.deep.equal([
      'planner.applyEffects',
      applyEffects,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'startNodes.get\' ' +
    'and startNodes.get as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[3]).to.deep.equal([
      'startNodes.get',
      startNodes.get,
    ]);
  });

  it('should call plannerEventDispatch.on with the event \'searchNode.clone\' ' +
    'and searchNode.clone as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[4]).to.deep.equal([
      'searchNode.clone',
      searchNode.clone,
    ]);
  });

  it('should call plannerEventDispatch.on with the event \'searchNode.create\' ' +
    'and searchNode.create as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[5]).to.deep.equal([
      'searchNode.create',
      searchNode.create,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'offlineReplanning.replan\' ' +
    'and offlineReplanning.replan as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[4]).to.deep.equal([
      'offlineReplanning.replan',
      offlineReplanning.replan,
    ]);
  });

  it('should call plannerEventDispatch.on with the event \'countActions.calculate\' ' +
    'and countActions.calculate as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[6]).to.deep.equal([
      'countActions.calculate',
      countActions.calculate,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'possibleActions.get\' ' +
    'and possibleActions.get as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[5]).to.deep.equal([
      'possibleActions.get',
      possibleActions.get,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'entryComponents.get\' ' +
    'and entryComponents.get as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.runOn.args[7]).to.deep.equal([
      'entryComponents.get',
      entryComponents.get,
    ]);
  });

  it('should call plannerEventDispatch.runOn with the event \'stateDifference.createDiff\' ' +
    'and stateDifference.createDiff as parameter', function() {
    registerPlannerEvents(plannerEventDispatch);

    expect(plannerEventDispatch.on.args[7]).to.deep.equal([
      'stateDifference.createDiff',
      stateDifference.createDiff,
    ]);
  });
});
