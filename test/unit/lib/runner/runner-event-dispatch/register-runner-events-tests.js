'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/runner-event-dispatch/register-runner-events.js', function() {
  let registerRunnerEvents;
  let testRunner;
  let testReportHandler;
  let runnerEventDispatch;
  let writeReportToDisk;
  let reporters;
  let debugPortHandler;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/runner-event-dispatch/register-runner-events.js');

    testRunner = {
      configure: sinon.stub(),
    };
    testReportHandler = {
      startReportHandler: sinon.stub(),
      createTestReport: sinon.stub(),
      appendTestStdErr: sinon.stub(),
      finalizeTestReport: sinon.stub(),
    };
    runnerEventDispatch = {
      on: sinon.stub(),
      emit: sinon.stub(),
    };
    writeReportToDisk = {
      json: sinon.stub(),
    };
    reporters = {
      basic: {
        printTestResult: sinon.stub(),
        printReportSummary: sinon.stub(),
      },
    };
    debugPortHandler = {
      getPort: sinon.stub(),
    };

    mockery.registerMock('../test-runner/test-runner.js', testRunner);
    mockery.registerMock('../test-runner/test-report-handler.js', testReportHandler);
    mockery.registerMock('../report-to-disk', writeReportToDisk);
    mockery.registerMock('../reporters', reporters);
    mockery.registerMock('../test-runner/debug-port-handler.js', debugPortHandler);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the required file is ran with runnerEventDispatch passed in', function() {
    it('should call runnerEventDispatch.on 12 times', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.callCount).to.equal(12);
    });

    it('should call runnerEventDispatch.on with the event \'runner.scheduled\' ' +
      'and testRunner.configure as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[0]).to.deep.equal([
        'runner.scheduled',
        testRunner.configure,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'runner.scheduled\' ' +
      'and testReportHandler.startReportHandler as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[1]).to.deep.equal([
        'runner.scheduled',
        testReportHandler.startReportHandler,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.testStarted\' ' +
      'and testReportHandler.createTestReport as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[2]).to.deep.equal([
        'testRunner.testStarted',
        testReportHandler.createTestReport,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.testFinished\' ' +
      'and testReportHandler.finalizeTestReport as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[3]).to.deep.equal([
        'testRunner.testFinished',
        testReportHandler.finalizeTestReport,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.testDataReceived\' ' +
      'and testReportHandler.appendTestReport as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[4]).to.deep.equal([
        'testRunner.testDataReceived',
        testReportHandler.appendTestReport,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.childStderrReceived\' ' +
      'and testReportHandler.appendTestStdErr as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[5]).to.deep.equal([
        'testRunner.childStderrReceived',
        testReportHandler.appendTestStdErr,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.done\' ' +
      'and testReportHandler.finalizeReport as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[6]).to.deep.equal([
        'testRunner.done',
        testReportHandler.finalizeReport,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testRunner.getDebugPort\' ' +
      'and testReportHandler.getPort as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[7]).to.deep.equal([
        'testRunner.getDebugPort',
        debugPortHandler.getPort,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testReportHandler.testReportFinalized\' ' +
      'and reporters.basic.printTestResult as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[8]).to.deep.equal([
        'testReportHandler.testReportFinalized',
        reporters.basic.printTestResult,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testReportHandler.reportFinalized\' ' +
      'and writeReportToDisk.json as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[9]).to.deep.equal([
        'testReportHandler.reportFinalized',
        writeReportToDisk.json,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testReportHandler.reportFinalized\' ' +
      'and reporters.basic.printReportSummary as parameters', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[10]).to.deep.equal([
        'testReportHandler.reportFinalized',
        reporters.basic.printReportSummary,
      ]);
    });

    it('should call runnerEventDispatch.on with the event \'testReportHandler.reportFinalized\'', function() {
      registerRunnerEvents = require(
        '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
      );

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[11][0]).to.equal('testReportHandler.reportFinalized');
    });

    describe('when the callback of runnerEventDispatch.on with the event ' +
      '\'testReportHandler.reportFinalized\' is called', function() {
      it('should call runnerEventDispatch.emit once with the event \'runner.ended\' as the parameter', function() {
        registerRunnerEvents = require(
          '../../../../../lib/runner/runner-event-dispatch/register-runner-events.js'
        );
        runnerEventDispatch.on.onCall(11).callsArg(1);

        registerRunnerEvents(runnerEventDispatch);

        expect(runnerEventDispatch.emit.args).to.deep.equal([
          ['runner.ended'],
        ]);
      });
    });
  });
});
