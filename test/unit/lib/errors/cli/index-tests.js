'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/index.js', function() {
  let INVALID_COMPONENT_PATH;
  let INVALID_PLANNER_ALGORITHM;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli');

    INVALID_COMPONENT_PATH = sinon.stub();
    INVALID_PLANNER_ALGORITHM = sinon.stub();

    mockery.registerMock('./invalid-component-path.js', INVALID_COMPONENT_PATH);
    mockery.registerMock('./invalid-planner-algorithm.js', INVALID_PLANNER_ALGORITHM);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 2 items on an object', function() {
    const result = require('../../../../../lib/errors/cli');

    expect(Object.getOwnPropertyNames(result).length).to.equal(2);
  });

  it('should have the property \'INVALID_COMPONENT_PATH\' with the value from requiring' +
    ' \'./invalid-component-path.js\'', function() {
    const result = require('../../../../../lib/errors/cli');

    expect(result.INVALID_COMPONENT_PATH).to.deep.equal(INVALID_COMPONENT_PATH);
  });

  it('should have the property \'INVALID_PLANNER_ALGORITHM\' with the value from requiring' +
    ' \'./invalid-planner-algorithm.js\'', function() {
    const result = require('../../../../../lib/errors/cli');

    expect(result.INVALID_PLANNER_ALGORITHM).to.deep.equal(INVALID_PLANNER_ALGORITHM);
  });
});
