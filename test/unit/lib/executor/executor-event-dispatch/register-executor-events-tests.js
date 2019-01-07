'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/executor-event-dispatch/register-executor-events.js', function() {
  let executeTestCase;
  let driverHandler;
  let executionEngine;
  let eeReportHandler;
  let assertionHandler;
  let executorEventDispatch;
  let registerExecutorEvents;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/executor/executor-event-dispatch/register-executor-events.js');

    executeTestCase = {
      configure: sinon.stub(),
    };
    driverHandler = {
      setup: sinon.stub(),
      quit: sinon.stub(),
      handleError: sinon.stub(),
    };
    executionEngine = {
      configure: sinon.stub(),
      errorOccurred: sinon.stub(),
      done: sinon.stub(),
      applyEffects: sinon.stub(),
      applyPreconditions: sinon.stub(),
      handleFailedStateCheck: sinon.stub(),
    };
    eeReportHandler = {
      startReport: sinon.stub(),
      startAction: sinon.stub(),
      endAction: sinon.stub(),
      startStep: sinon.stub(),
      endStep: sinon.stub(),
      addPreconditions: sinon.stub(),
      finalizeReport: sinon.stub(),
    };
    assertionHandler = {
      assertPageState: sinon.stub(),
      assertExpectedPageState: sinon.stub(),
    };
    executorEventDispatch = {
      on: sinon.stub(),
    };

    mockery.registerMock('../execute-test-case.js', executeTestCase);
    mockery.registerMock('../driver-handler.js', driverHandler);
    mockery.registerMock('../execution-engine/execution-engine.js', executionEngine);
    mockery.registerMock('../execution-engine/execution-engine-report-handler.js', eeReportHandler);
    mockery.registerMock('../assertion-handler.js', assertionHandler);

    registerExecutorEvents =
            require('../../../../../lib/executor/executor-event-dispatch/register-executor-events.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call executorEventDispatch.on 19 times', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.callCount).to.equal(19);
  });

  it('should call executorEventDispatch.on with the event \'executor.scheduled\' ' +
        'and executeTestCase.configure as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[0]).to.deep.equal([
      'executor.scheduled',
      executeTestCase.configure,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executeTestCase.exceptionCaught\' ' +
        'and executionEngine.errorOccurred as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[1]).to.deep.equal([
      'executeTestCase.exceptionCaught',
      executionEngine.errorOccurred,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executeTestCase.errorHandled\' ' +
        'and executionEngine.done as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[2]).to.deep.equal([
      'executeTestCase.errorHandled',
      executionEngine.done,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executeTestCase.setupDriver\' ' +
        'and driverHandler.setup as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[3]).to.deep.equal([
      'executeTestCase.setupDriver',
      driverHandler.setup,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executeTestCase.configured\' ' +
        'and executionEngine.configure as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[4]).to.deep.equal([
      'executeTestCase.configured',
      executionEngine.configure,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.configured\' ' +
        'and eeReportHandler.startReport as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[5]).to.deep.equal([
      'executionEngine.configured',
      eeReportHandler.startReport,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.actionStarted\' ' +
        'and eeReportHandler.startAction as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[6]).to.deep.equal([
      'executionEngine.actionStarted',
      eeReportHandler.startAction,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.actionFinished\' ' +
        'and eeReportHandler.endAction as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[7]).to.deep.equal([
      'executionEngine.actionFinished',
      eeReportHandler.endAction,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.stepStarted\' ' +
        'and eeReportHandler.startStep as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[8]).to.deep.equal([
      'executionEngine.stepStarted',
      eeReportHandler.startStep,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.stepEnded\' ' +
        'and eeReportHandler.endStep as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[9]).to.deep.equal([
      'executionEngine.stepEnded',
      eeReportHandler.endStep,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.done\' ' +
        'and eeReportHandler.finalizeReport as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[10]).to.deep.equal([
      'executionEngine.done',
      eeReportHandler.finalizeReport,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.done\' ' +
        'and driverHandler.quit as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[11]).to.deep.equal([
      'executionEngine.done',
      driverHandler.quit,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.preconditionsReadyForVerification\' ' +
        'and assertionHandler.assertPageState as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[12]).to.deep.equal([
      'executionEngine.preconditionsReadyForVerification',
      assertionHandler.assertPageState,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'executionEngine.effectsReadyForVerification\' ' +
        'and assertionHandler.assertExpectedPageState as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[13]).to.deep.equal([
      'executionEngine.effectsReadyForVerification',
      assertionHandler.assertExpectedPageState,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'eeReportHandler.errorOccured\' ' +
        'and driverHandler.handleError as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[14]).to.deep.equal([
      'eeReportHandler.errorOccured',
      driverHandler.handleError,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'assertionHandler.stateCheckTimedOut\' ' +
        'and executionEngine.handleFailedStateCheck as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[15]).to.deep.equal([
      'assertionHandler.stateCheckTimedOut',
      executionEngine.handleFailedStateCheck,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'assertionHandler.effectsVerified\' ' +
        'and executionEngine.applyEffects as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[16]).to.deep.equal([
      'assertionHandler.effectsVerified',
      executionEngine.applyEffects,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'assertionHandler.preconditionsVerified\' ' +
        'and executionEngine.applyPreconditions as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[17]).to.deep.equal([
      'assertionHandler.preconditionsVerified',
      executionEngine.applyPreconditions,
    ]);
  });

  it('should call executorEventDispatch.on with the event \'assertionHandler.preconditionsCalculated\' ' +
        'and eeReportHandler.addPreconditions as parameters', function() {
    registerExecutorEvents(executorEventDispatch);

    expect(executorEventDispatch.on.args[18]).to.deep.equal([
      'assertionHandler.preconditionsCalculated',
      eeReportHandler.addPreconditions,
    ]);
  });
});
