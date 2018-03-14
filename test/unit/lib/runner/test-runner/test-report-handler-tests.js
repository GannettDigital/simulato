'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/test-report-handler.js', function() {
  describe('on file being required', function() {
    let testReportHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of printOutput to a new EventEmitter', function() {
      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');

      expect(Object.getPrototypeOf(testReportHandler)).to.deep.equal(EventEmitterInstance);
    });
  });

  describe('startReportHandler', function() {
    let testReportHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      sinon.stub(process, 'hrtime').returns([0, 0]);

      mockery.registerMock('events', {EventEmitter});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    it('should call process.hrtime once', function() {
      testReportHandler.startReportHandler();

      expect(process.hrtime.callCount).to.equal(1);
    });

    it('should set the _startTime to process.hrTime', function() {
      testReportHandler.startReportHandler();

      expect(testReportHandler._startTime).to.deep.equal([0, 0]);
    });
  });

  describe('appendTestReport', function() {
    let testReportHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let sampleTestReport;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      sampleTestReport = {
        testName: 'The test that failed',
        error: {
          instanceName: 'componentA',
          actionName: 'actionX',
          failedStep: 'effects',
        },
      };

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should increment testCount once', function() {
      testReportHandler._report.testCount = 2;

      testReportHandler.appendTestReport(sampleTestReport);

      expect(testReportHandler._report.testCount).to.equal(3);
    });

    it('should push the passed in report onto to testReports array', function() {
      testReportHandler.appendTestReport(sampleTestReport);

      expect(testReportHandler._report.testReports).to.deep.equal([
        {
          testName: 'The test that failed',
          error: {
            instanceName: 'componentA',
            actionName: 'actionX',
            failedStep: 'effects',
          },
        },
      ]);
    });

    describe('if the report has errors', function() {
      it('should increment failedTestCount once', function() {
        testReportHandler._report.failedTestCount = 0;

        testReportHandler.appendTestReport(sampleTestReport);

        expect(testReportHandler._report.failedTestCount).to.equal(1);
      });
    });

    describe('if the report has no errors', function() {
      it('should not increment failedTestCount', function() {
        delete sampleTestReport.error;

        testReportHandler.appendTestReport(sampleTestReport);

        expect(testReportHandler._report.failedTestCount).to.equal(0);
      });
    });
  });

  describe('finalizeReport', function() {
    let testReportHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      sinon.stub(process, 'hrtime').returns([4, 54321]);

      mockery.registerMock('events', {EventEmitter});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
      testReportHandler._startTime = [0, 0];
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    it('should call process.hrtime once', function() {
      testReportHandler.finalizeReport();

      expect(process.hrtime.callCount).to.equal(1);
    });

    it('should set the _report.time to process.hrTime', function() {
      testReportHandler.finalizeReport();

      expect(testReportHandler._report.time).to.deep.equal([4, 54321]);
    });

    it('should call printOutput.emit with the correct event', function() {
      testReportHandler.finalizeReport();

      expect(testReportHandler.emit.args).to.deep.equal([
        [
          'testReportHandler.reportFinalized',
          testReportHandler._report,
        ],
      ]);
    });
  });
});
