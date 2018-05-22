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

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/runner-event-dispatch/register-runner-events.js');

    testRunner = {
      on: sinon.stub(),
      configure: sinon.stub(),
    };
    testReportHandler = {
      on: sinon.stub(),
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

    mockery.registerMock('../test-runner/test-runner.js', testRunner);
    mockery.registerMock('../test-runner/test-report-handler.js', testReportHandler);
    mockery.registerMock('../report-to-disk', writeReportToDisk);
    mockery.registerMock('../reporters', reporters);
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
      + 'and testReportHandler.createTestReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[0]).to.deep.equal([
        'testRunner.testStarted',
        testReportHandler.createTestReport,
      ]);
    });

    it('should call testRunner.on with testRunner.testFinished'
      + 'and testReportHandler.finalizeTestReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[1]).to.deep.equal([
        'testRunner.testFinished',
        testReportHandler.finalizeTestReport,
      ]);
    });

    it('should call testRunner.on with testRunner.testDataReceived'
      + 'and testReportHandler.appendTestReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[2]).to.deep.equal([
        'testRunner.testDataReceived',
        testReportHandler.appendTestReport,
      ]);
    });

    it('should call testRunner.on with testRunner.childStderrReceived'
      + 'and testReportHandler.appendTestStdErr', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[3]).to.deep.equal([
        'testRunner.childStderrReceived',
        testReportHandler.appendTestStdErr,
      ]);
    });

    it('should call testRunner.on with testRunner.done'
      + 'and testReportHandler.finalizeReport', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.args[4]).to.deep.equal([
        'testRunner.done',
        testReportHandler.finalizeReport,
      ]);
    });

    it('should call testRunner.on 5 times', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testRunner.on.callCount).to.equal(5);
    });

    it('should call testReportHandler.on with testReportHandler.testReportFinalized'
      + 'and reporters.basic.printTestResult', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[0]).to.deep.equal([
        'testReportHandler.testReportFinalized',
        reporters.basic.printTestResult,
      ]);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized'
      + 'and writeReportToDisk.json', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[1]).to.deep.equal([
        'testReportHandler.reportFinalized',
        writeReportToDisk.json,
      ]);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized'
      + 'and reporters.basic.printReportSummary', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[2]).to.deep.equal([
        'testReportHandler.reportFinalized',
        reporters.basic.printReportSummary,
      ]);
    });

    it('should call testReportHandler.on with testReportHandler.reportFinalized as first param', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[3][0]).to.equal('testReportHandler.reportFinalized');
    });

    it('should call testReportHandler.on with with anonymous function as 2nd param', function() {
      registerRunnerEvents = require('../../../../../'
        + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.args[3][1]).to.be.a('function');
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

    it('should call testReportHanlder.on four times', function() {
      registerRunnerEvents = require('../../../../../'
      + 'lib/runner/runner-event-dispatch/register-runner-events.js');

      registerRunnerEvents(runnerEventDispatch);

      expect(testReportHandler.on.callCount).to.equal(4);
    });
  });
});
