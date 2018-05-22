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

    it('should set the testReportHandler._report.time to process.hrTime', function() {
      testReportHandler.startReportHandler();

      expect(testReportHandler._report.time).to.deep.equal([0, 0]);
    });
  });

  describe('createTestReport', function() {
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

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should increment testCount once', function() {
      testReportHandler._report.testCount = 2;

      testReportHandler.createTestReport(3, 'testName');

      expect(testReportHandler._report.testCount).to.equal(3);
    });

    it('should increment failedTestCount once', function() {
      testReportHandler._report.failedTestCount = 1;

      testReportHandler.createTestReport(3, 'testName');

      expect(testReportHandler._report.failedTestCount).to.equal(2);
    });

    it('should create a base report for the test number passed in', function() {
      testReportHandler.createTestReport(3, 'testName');

      expect(testReportHandler._report.testReports[3]).to.deep.equal({
        testName: 'testName',
        status: 'fail',
      });
    });
  });

  describe('appendTestSrdErr', function() {
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

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if stdErr already contains a value inside the test report', function() {
      it('should concatenate the passed in stdErr to the existing stdErr', function() {
        testReportHandler._report.testReports[2] = {
          stdErr: 'previousStdErr ',
        };
        testReportHandler.appendTestStdErr('newStdErr', 2);

        expect(testReportHandler._report.testReports[2].stdErr).to.equal('previousStdErr newStdErr');
      });
    });

    describe('if stdErr is undefined for the test report', function() {
      it('should the reports .stdErr to the passed in stdErr', function() {
        testReportHandler._report.testReports[2] = {};
        testReportHandler.appendTestStdErr('newStdErr', 2);

        expect(testReportHandler._report.testReports[2].stdErr).to.equal('newStdErr');
      });
    });
  });

  describe('appendTestReport', function() {
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

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the report for the passed in testNumber contains stdErr', function() {
      it('should set the passed in reports.stdErr, and set that full report to '
        + 'testReportHandler._report.testReports[<passedInTestNumber>]', function() {
        testReportHandler._report.testReports[0] = {
          stdErr: 'some stdErr',
        };

        testReportHandler.appendTestReport({status: 'fail', somePropFromReport: true}, 0);

        expect(testReportHandler._report.testReports[0]).to.deep.equal({
          stdErr: 'some stdErr',
          status: 'fail',
          somePropFromReport: true,
        });
      });

      describe('if the passed in report has .status of \'pass\'', function() {
        it('should decrement testReportHandler._report.failedTestCount by one', function() {
          testReportHandler._report.testReports[0] = {
            stdErr: 'some stdErr',
          };
          testReportHandler._report.failedTestCount = 2;

          testReportHandler.appendTestReport({status: 'pass', somePropFromReport: true}, 0);

          expect(testReportHandler._report.failedTestCount).to.equal(1);
        });

        it('should set the passed in reports.stdErr, and set that full report to '
          + 'testReportHandler._report.testReports[<passedInTestNumber>] with status as \'pass\'', function() {
          testReportHandler._report.testReports[0] = {
            stdErr: 'some stdErr',
          };

          testReportHandler.appendTestReport({status: 'pass', somePropFromReport: true}, 0);

          expect(testReportHandler._report.testReports[0]).to.deep.equal({
            stdErr: 'some stdErr',
            status: 'pass',
            somePropFromReport: true,
          });
        });
      });
    });

    describe('if the report for the passed in testNumber DOES NOT contain stdErr', function() {
      it('should set the passed in report to testReportHandler._report.testReports[<passedInTestNumber>]', function() {
        testReportHandler._report.testReports[0] = {};

        testReportHandler.appendTestReport({status: 'fail', somePropFromReport: true}, 0);

        expect(testReportHandler._report.testReports[0]).to.deep.equal({
          status: 'fail',
          somePropFromReport: true,
        });
      });

      describe('if the passed in report has .status of \'pass\'', function() {
        it('should set the passed in report to testReportHandler._report.testReports[<passedInTestNumber>] '
          + 'with status \'pass\'', function() {
          testReportHandler._report.testReports[0] = {};

          testReportHandler.appendTestReport({status: 'pass', somePropFromReport: true}, 0);

          expect(testReportHandler._report.testReports[0]).to.deep.equal({
            status: 'pass',
            somePropFromReport: true,
          });
        });
      });
    });
  });

  describe('finalizeTestReport', function() {
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

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call testReportHandler.emit with the event \'testReportHandler.testReportFinalized\' '
      + 'and the report of the passed in testNumber', function() {
      testReportHandler._report.testReports[0] = {
        report: 'data',
      };

      testReportHandler.finalizeTestReport(0);

      expect(testReportHandler.emit.args).to.deep.equal([[
        'testReportHandler.testReportFinalized',
        {report: 'data'},
      ]]);
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

    describe('if testReportHandler._failedTestCount is 0', function() {
      it('should call testReportHandler.emit with the event\'testReportHandler.reportFinalized\' and '
        + 'and testReportHandler._report with the report having status of \'pass\'', function() {
        testReportHandler.finalizeReport();

        expect(testReportHandler.emit.args).to.deep.equal([
          [
            'testReportHandler.reportFinalized',
            {
              failedTestCount: 0,
              status: 'pass',
              testCount: 0,
              testReports: [],
              time: [4, 54321],
            },
          ],
        ]);
      });
    });

    it('should call testReportHandler.emit with the event\'testReportHandler.reportFinalized\' and '
      + 'and testReportHandler._report', function() {
      testReportHandler._report.failedTestCount = 1;

      testReportHandler.finalizeReport();

      expect(testReportHandler.emit.args).to.deep.equal([
        [
          'testReportHandler.reportFinalized',
          {
            failedTestCount: 1,
            status: 'fail',
            testCount: 0,
            testReports: [],
            time: [4, 54321],
          },
        ],
      ]);
    });
  });
});
