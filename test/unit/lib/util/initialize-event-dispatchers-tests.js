'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/initialize-event-dispatchers', function() {
  let initializeGlobalEventDispatch;
  let initializeRunnerEventDispatch;
  let initializePlannerEventDispatch;
  let initializeExecuteEventDispatch;
  let initializeCliEventDispatch;
  let initializeEventDispatchers;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/util/initialize-event-dispatchers');

    initializeGlobalEventDispatch = sinon.stub();
    initializeRunnerEventDispatch = sinon.stub();
    initializePlannerEventDispatch = sinon.stub();
    initializeExecuteEventDispatch = sinon.stub();
    initializeCliEventDispatch = sinon.stub();

    mockery.registerMock(
        '../global-event-dispatch/initialize-global-event-dispatch',
        initializeGlobalEventDispatch,
    );
    mockery.registerMock(
        '../runner/runner-event-dispatch/initialize-runner-event-dispatch',
        initializeRunnerEventDispatch,
    );
    mockery.registerMock(
        '../planner/planner-event-dispatch/initialize-planner-event-dispatch.js',
        initializePlannerEventDispatch,
    );
    mockery.registerMock(
        '../executor/executor-event-dispatch/initialize-executor-event-dispatch.js',
        initializeExecuteEventDispatch,
    );
    mockery.registerMock(
        '../cli/cli-event-dispatch/initialize-cli-event-dispatch.js',
        initializeCliEventDispatch,
    );

    initializeEventDispatchers = require('../../../../lib/util/initialize-event-dispatchers');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call initializeGlobalEventDispatch once with no arguments', function() {
    initializeEventDispatchers();

    expect(initializeGlobalEventDispatch.args).to.deep.equal([[]]);
  });

  it('should call initializeCliEventDispatch once with no arguments', function() {
    initializeEventDispatchers();

    expect(initializeCliEventDispatch.args).to.deep.equal([[]]);
  });

  it('should call initializeRunnerEventDispatch once with no arguments', function() {
    initializeEventDispatchers();

    expect(initializeRunnerEventDispatch.args).to.deep.equal([[]]);
  });

  it('should call initializePlannerEventDispatch once with no arguments', function() {
    initializeEventDispatchers();

    expect(initializePlannerEventDispatch.args).to.deep.equal([[]]);
  });

  it('should call initializeExecuteEventDispatch once with no arguments', function() {
    initializeEventDispatchers();

    expect(initializeExecuteEventDispatch.args).to.deep.equal([[]]);
  });
});
