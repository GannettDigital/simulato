'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/planner/index.js', function() {
  let GOAL_NOT_FOUND;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/planner');

    GOAL_NOT_FOUND = sinon.stub();

    mockery.registerMock('./goal-not-found.js', GOAL_NOT_FOUND);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 1 item on an object', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(Object.getOwnPropertyNames(result).length).to.equal(1);
  });

  it('should have the property \'GOAL_NOT_FOUND\' with the value from requiring'
    + ' \'./goal-not-found.js\'', function() {
    let result = require('../../../../../lib/errors/planner');

    expect(result.GOAL_NOT_FOUND).to.deep.equal(GOAL_NOT_FOUND);
  });
});
