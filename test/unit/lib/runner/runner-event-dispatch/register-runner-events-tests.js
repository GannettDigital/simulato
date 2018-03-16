'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/runner-event-dispatch/register-runner-events.js', function() {
  let registerRunnerEvents;
  let testRunner;
  let childProcessOutputHandler;
  let testReportHandler;
  let runnerEventDispatch;
  let writeReportToDisk;
  let printOutput;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/runner-event-dispatch/register-runner-events.js');

    testRunner = {
      on: sinon.stub(),
      configure: function() {},
    };
    childProcessOutputHandler = {
      on: sinon.stub(),
      addNewChildOutput: function() {},
      appendStdout: function() {},
      appendStderr: function() {},
      finalizeChildOutput: function() {},
    };
    testReportHandler = {
      on: sinon.stub(),
      startReportHanlder: function() {},
      appendTestReport: function() {},
      finalizeReport: function() {},
    };
    runnerEventDispatch = {
      on: sinon.stub(),
      emit: sinon.stub(),
    };
    writeReportToDisk = {
      writeReport: function() {},
    };
    printOutput = {
      addChildOutput: function() {},
      addTestSummary: function() {},
    };

    mockery.registerMock('../test-runner/test-runner.js', testRunner);
    mockery.registerMock('../test-runner/child-process-output-handler.js', childProcessOutputHandler);
    mockery.registerMock('../test-runner/test-report-handler.js', testReportHandler);
    mockery.registerMock('../test-runner/write-report-to-disk.js', writeReportToDisk);
    mockery.registerMock('../test-runner/print-output.js', printOutput);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the required file is ran with runnerEventDispatch passed in', function() {
    it('should call runnerEventDispatch.on with runner.scheduled and testRunner.configure', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[0]).to.deep.equal([
        'runner.scheduled',
        testRunner.configure,
      ]);
    });

    it('should call runnerEventDispatch.on with runner.scheduled'
      + 'and testReportHandler.startReportHandler', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.args[1]).to.deep.equal([
        'runner.scheduled',
        testReportHandler.startReportHandler,
      ]);
    });

    it('should call runnerEventDispatch.on twice', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(runnerEventDispatch.on.callCount).to.equal(2);
    });

    it('should call testRunner.on with testRunner.testStarted'
      + 'and childProcessOutputHandler.addNewChildOutput', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[0]).to.deep.equal([
        'testRunner.testStarted',
        childProcessOutputHandler.addNewChildOutput,
      ]);
    });

    it('should call testRunner.on with testRunner.testStarted'
      + 'and childProcessOutputHandler.addNewChildOutput', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[0]).to.deep.equal([
        'testRunner.testStarted',
        childProcessOutputHandler.addNewChildOutput,
      ]);
    });

    it('should call testRunner.on with testRunner.testDataReceived'
      + 'and testReportHandler.appendTestReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[1]).to.deep.equal([
        'testRunner.testDataReceived',
        testReportHandler.appendTestReport,
      ]);
    });

    it('should call testRunner.on with testRunner.childStdoutReceived'
      + 'and childProcessOutputHandler.appendStdout', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[2]).to.deep.equal([
        'testRunner.childStdoutReceived',
        childProcessOutputHandler.appendStdout,
      ]);
    });

    it('should call testRunner.on with testRunner.childStderrReceived'
      + 'and childProcessOutputHandler.appendStderr', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[3]).to.deep.equal([
        'testRunner.childStderrReceived',
        childProcessOutputHandler.appendStderr,
      ]);
    });

    it('should call testRunner.on with testRunner.done'
      + 'and childProcessOutputHandler.finalizeChildOutput', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[4]).to.deep.equal([
        'testRunner.done',
        childProcessOutputHandler.finalizeChildOutput,
      ]);
    });

    it('should call testRunner.on with testRunner.done'
      + 'and testReportHandler.finalizeReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[5]).to.deep.equal([
        'testRunner.done',
        testReportHandler.finalizeReport,
      ]);
    });

    it('should call testRunner.on six times', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.callCount).to.equal(6);
    });

    it('should call childProcessOutputHandler.on with childProcessOutputHandler.childOutputFinalized'
      + 'and printOutput.addChildOutput', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(childProcessOutputHandler.on.args[0]).to.deep.equal([
        'childProcessOutputHandler.childOutputFinalized',
        printOutput.addChildOutput,
      ]);
    });

    it('should call childProcessOutputHandler.on once', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(childProcessOutputHandler.on.callCount).to.equal(1);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized'
      + 'and writeReportToDisk.writeReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[0]).to.deep.equal([
        'testReportHandler.reportFinalized',
        writeReportToDisk.writeReport,
      ]);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized'
      + 'and printOutput.addTestSummary', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[1]).to.deep.equal([
        'testReportHandler.reportFinalized',
        printOutput.addTestSummary,
      ]);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized as first param', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[2][0]).to.equal('testReportHandler.reportFinalized');
    });

    it('should call testReportHandler.on with with anonymous function as 2nd param', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[2][1]).to.be.a('function');
    });

    describe('when the testReportHandler.on testReportHandler.reportFinalized callback is called', function() {
      it('should call runnerEventDispatch.emit with the correct event runner.ended', function() {
        registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');
        testReportHandler.on.callsArgWith(1);

        registerRunnerEvents(runnerEventDispatch);

        expect(runnerEventDispatch.emit.args).to.deep.equal([
          ['runner.ended'],
        ]);
      });
    });

    it('should call testReportHanlder.on thrice', function() {
      registerRunnerEvents = require('../../../../../'
      + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.callCount).to.equal(3);
    });
  });
});
