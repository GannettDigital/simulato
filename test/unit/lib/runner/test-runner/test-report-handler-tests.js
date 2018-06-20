'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/test-report-handler.js', function() {
  describe('on file being required', function() {
    let Emitter;
    let runnerEventDispatch;
    let testReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      runnerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', runnerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn with testReportHandler and runnerEventDispatch', function() {
      testReportHandler = require(
        '../../../../../lib/runner/test-runner/test-report-handler.js'
      );

      expect(Emitter.mixIn.args).to.deep.equal([
          [
            testReportHandler,
            runnerEventDispatch,
          ],
      ]);
    });
  });

  describe('startReportHandler', function() {
    let testReportHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([0, 0]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

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
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('when a testReport already exists for the passed in testNumber', function() {
      it('should add a push on a new base report to that testReports.testRuns', function() {
        testReportHandler._report.testReports[3] = {testRuns: []};

        testReportHandler.createTestReport(3, 'testName');

        expect(testReportHandler._report.testReports[3]).to.deep.equal({
          testRuns: [
            {
              stdErr: '',
              report: {},
            },
          ],
        });
      });
    });

    describe('when a testReport does NOT exist for the passed in testNumber', function() {
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
          rerunCount: 0,
          testRuns: [{stdErr: '', report: {}}],
        });
      });
    });
  });

  describe('appendTestSrdErr', function() {
    let testReportHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should concatenate the passed in stdErr to the existing stdErr', function() {
      testReportHandler._report.testReports[2] = {
        rerunCount: 1,
        testRuns: [
          {stdErr: 'THIS SHOULDNT BE USED '},
          {stdErr: 'previousStdErr '},
        ],
      };
      testReportHandler.appendTestStdErr('newStdErr', 2);

      expect(testReportHandler._report.testReports[2].testRuns[1].stdErr).to.equal('previousStdErr newStdErr');
    });
  });

  describe('appendTestReport', function() {
    let testReportHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the passed in report to '
      + 'testReportHandler._report.testReports[<passedInTestNumber>]'
      + '.testRuns[testReportHandler._report.testReports[<passedInTestNumber>].rerunCount].report', function() {
      testReportHandler._report.testReports[0] = {
        rerunCount: 0,
        testRuns: [{stdErr: ''}],
      };

      testReportHandler.appendTestReport({status: 'fail', somePropFromReport: true}, 0);

      expect(testReportHandler._report.testReports[0].testRuns[0]).to.deep.equal({
        stdErr: '',
        report: {
          status: 'fail',
          somePropFromReport: true,
        },
      });
    });
  });

  describe('finalizeTestReport', function() {
    let testReportHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the most recent testRun report status is \'pass\'', function() {
      it('should decrement testRunner._report.failedTestCount once', function() {
        testReportHandler._report = {
          failedTestCount: 3,
          testReports: [{
              status: 'fail',
              rerunCount: 0,
              testRuns: [{
                report: {
                  status: 'pass',
                },
              }],
          }],
        };

        testReportHandler.finalizeTestReport(0, 0);

        expect(testReportHandler._report.failedTestCount).to.equal(2);
      });

      it('should set the testReport for the passed in testNumbers status to \'pass\'', function() {
        testReportHandler._report = {
          failedTestCount: 3,
          testReports: [{
              status: 'fail',
              rerunCount: 0,
              testRuns: [{
                report: {
                  status: 'pass',
                },
              }],
          }],
        };

        testReportHandler.finalizeTestReport(0, 0);

        expect(testReportHandler._report.testReports[0].status).to.equal('pass');
      });
    });

    describe('if the most recent testRun report status is \'fail\' '
      + 'and the passed in rerunCount is truthy', function() {
      it('should increment the testsReports rerunCount once', function() {
        testReportHandler._report = {
          failedTestCount: 3,
          testReports: [{
              status: 'fail',
              rerunCount: 0,
              testRuns: [{
                report: {
                  status: 'fail',
                },
              }],
          }],
        };

        testReportHandler.finalizeTestReport(0, 1);

        expect(testReportHandler._report.testReports[0].rerunCount).to.equal(1);
      });

      it('should set the testReport for the passed in testNumbers status to \'rerun\'', function() {
        testReportHandler._report = {
          failedTestCount: 3,
          testReports: [{
              status: 'fail',
              rerunCount: 0,
              testRuns: [{
                report: {
                  status: 'fail',
                },
              }],
          }],
        };

        testReportHandler.finalizeTestReport(0, 3);

        expect(testReportHandler._report.testReports[0].testRuns[0].report.status).to.equal('rerun');
      });
    });

    it('should call testReportHandler.emit with the event \'testReportHandler.testReportFinalized\' '
      + 'and the report of the passed in testNumber most recent testRun', function() {
      testReportHandler._report.testReports[0] = {
        rerunCount: 0,
        testRuns: [
          {
            report: 'report',
          },
        ],
      };

      testReportHandler.finalizeTestReport(0);

      expect(testReportHandler.emit.args).to.deep.equal([[
        'testReportHandler.testReportFinalized',
        'report',
      ]]);
    });
  });

  describe('finalizeReport', function() {
    let testReportHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
            myObject.on = sinon.stub();
            myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([4, 54321]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

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
