'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/planner/index.js', function() {
  let GOAL_NOT_FOUND;
  let FAILED_TO_BACKTRACK;
  let DUPLICATE_PLAN_GENERATED;
  let NO_STARTING_ACTIONS;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/planner');

    GOAL_NOT_FOUND = sinon.stub();
    FAILED_TO_BACKTRACK = sinon.stub();
    DUPLICATE_PLAN_GENERATED = sinon.stub();
    NO_STARTING_ACTIONS = sinon.stub();

    mockery.registerMock('./goal-not-found.js', GOAL_NOT_FOUND);
    mockery.registerMock('./failed-to-backtrack.js', FAILED_TO_BACKTRACK);
    mockery.registerMock('./duplicate-plan-generated.js', DUPLICATE_PLAN_GENERATED);
    mockery.registerMock('./no-starting-actions.js', NO_STARTING_ACTIONS);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 4 items on an object', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(Object.getOwnPropertyNames(result).length).to.equal(4);
  });

  it('should have the property \'GOAL_NOT_FOUND\' with the value from requiring'
    + ' \'./goal-not-found.js\'', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(result.GOAL_NOT_FOUND).to.deep.equal(GOAL_NOT_FOUND);
  });

  it('should have the property \'FAILED_TO_BACKTRACK\' with the value from requiring'
    + ' \'./failed-to-backtrack.js\'', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(result.FAILED_TO_BACKTRACK).to.deep.equal(FAILED_TO_BACKTRACK);
  });

  it('should have the property \'DUPLICATE_PLAN_GENERATED\' with the value from requiring'
    + ' \'./duplicate-plan-generated.js\'', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(result.DUPLICATE_PLAN_GENERATED).to.deep.equal(DUPLICATE_PLAN_GENERATED);
  });

  it('should have the property \'NO_STARTING_ACTIONS\' with the value from requiring'
    + ' \'./no-starting-actions.js\'', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(result.NO_STARTING_ACTIONS).to.deep.equal(NO_STARTING_ACTIONS);
  });
});
