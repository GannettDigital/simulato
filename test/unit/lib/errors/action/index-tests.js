'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/index.js', function() {
  let EXPECTED_STATE_ERROR;
  let PRECONDITION_ASSERTION_FAILURE;
  let PRECONDITION_CHECK_FAILED;
  let ACTION_TYPE_ERROR;
  let ACTIONS_NOT_OBJECT;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action');

    EXPECTED_STATE_ERROR = sinon.stub();
    PRECONDITION_ASSERTION_FAILURE = sinon.stub();
    PRECONDITION_CHECK_FAILED = sinon.stub();
    ACTION_TYPE_ERROR = sinon.stub();
    ACTIONS_NOT_OBJECT = sinon.stub();

    mockery.registerMock('./expected-state-error.js', EXPECTED_STATE_ERROR);
    mockery.registerMock('./precondition-assertion-failure.js', PRECONDITION_ASSERTION_FAILURE);
    mockery.registerMock('./precondition-check-failed.js', PRECONDITION_CHECK_FAILED);
    mockery.registerMock('./action-type-error.js', ACTION_TYPE_ERROR);
    mockery.registerMock('./actions-not-object.js', ACTIONS_NOT_OBJECT);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 5 items on an object', function() {
    let result = require('../../../../../lib/errors/action');

    expect(Object.getOwnPropertyNames(result).length).to.equal(5);
  });

  it('should have the property \'EXPECTED_STATE_ERROR\' with the value from requiring'
        + ' \'./expected-state-error.js\'', function() {
    let result = require('../../../../../lib/errors/action');

    expect(result.EXPECTED_STATE_ERROR).to.deep.equal(EXPECTED_STATE_ERROR);
  });

  it('should have the property \'PRECONDITION_ASSERTION_FAILURE\' with the value from requiring'
        + ' \'./precondition-assertion-failure.js\'', function() {
    let result = require('../../../../../lib/errors/action');

    expect(result.PRECONDITION_ASSERTION_FAILURE).to.deep.equal(PRECONDITION_ASSERTION_FAILURE);
  });

  it('should have the property \'PRECONDITION_CHECK_FAILED\' with the value from requiring'
        + ' \'./precondition-check-failed.js\'', function() {
    let result = require('../../../../../lib/errors/action');

    expect(result.PRECONDITION_CHECK_FAILED).to.deep.equal(PRECONDITION_CHECK_FAILED);
  });

  it('should have the property \'ACTION_TYPE_ERROR\' with the value from requiring'
        + ' \'./action-type-error.js\'', function() {
    let result = require('../../../../../lib/errors/action');

    expect(result.ACTION_TYPE_ERROR).to.deep.equal(ACTION_TYPE_ERROR);
  });

  it('should have the property \'ACTIONS_NOT_OBJECT\' with the value from requiring'
        + ' \'./actions-not-object.js\'', function() {
    let result = require('../../../../../lib/errors/action');

    expect(result.ACTIONS_NOT_OBJECT).to.deep.equal(ACTIONS_NOT_OBJECT);
  });
});
