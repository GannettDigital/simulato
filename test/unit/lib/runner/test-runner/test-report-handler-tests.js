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
      mockery.registerMock('../../util/config/config-handler.js', {});
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
      mockery.registerMock('../../util/config/config-handler.js', {});

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
      mockery.registerMock('../../util/config/config-handler.js', {});

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
      mockery.registerMock('../../util/config/config-handler.js', {});

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
      mockery.registerMock('../../util/config/config-handler.js', {});

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
    let configHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      configHandler = {
        get: sinon.stub(),
      };

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
      testReportHandler._handleTestReport = sinon.stub();
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

    describe('if the most recent testRun report is empty', function() {
      it('should set the report name to testReport.testName and the report status to \'fail\'', function() {
        testReportHandler._report = {
          failedTestCount: 3,
          testReports: [{
            testName: 'myTestName',
            status: 'fail',
            rerunCount: 0,
            testRuns: [{
              report: {},
            }],
          }],
        };

        testReportHandler.finalizeTestReport(0, -1);

        expect(testReportHandler._report.testReports[0].testRuns[0].report).to.deep.equal({
          testName: 'myTestName',
          status: 'fail',
        });
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

    describe('if the most recent testRun report status is \'fail\' '
      + 'and the passed in rerunCount is falsey', function() {
      describe('when config for deferFailureReports is true', function() {
        it('should add the report to _failedReports', function() {
          configHandler.get.returns(true);

          testReportHandler._failedReports = [{
            status: 'fail',
            label: 'report1',
          }];

          testReportHandler._report = {
            failedTestCount: 3,
            testReports: [{
              status: 'fail',
              rerunCount: 0,
              testRuns: [{
                report: {
                  status: 'fail',
                  label: 'report2',
                },
              }],
            }],
          };

          testReportHandler.finalizeTestReport(0, -1);

          expect(testReportHandler._failedReports).to.eql([
            {
              status: 'fail',
              label: 'report1',
            },
            {
              status: 'fail',
              label: 'report2',
            },
          ]);
        });

        it('should not call _handleTestReport', function() {
          configHandler.get.returns(true);

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

          testReportHandler.finalizeTestReport(0, -1);

          expect(testReportHandler._handleTestReport.args).to.eql([]);
        });
      });
    });

    it('should call _handleTestReport with the report of the passed in testNumber most recent testRun', function() {
      testReportHandler._report.testReports[0] = {
        rerunCount: 0,
        testRuns: [
          {
            report: 'report',
          },
        ],
      };

      testReportHandler.finalizeTestReport(0);

      expect(testReportHandler._handleTestReport.args).to.deep.equal([[
        'report',
      ]]);
    });
  });

  describe('finalizeReport', function() {
    let testReportHandler;
    let configHandler;
    let Emitter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-report-handler.js');

      configHandler = {
        get: sinon.stub(),
      };

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
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
      testReportHandler._printFailedReports = sinon.stub();
      testReportHandler._handleTestReportSummary = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    describe('when the config for deferFailureReports is true', function() {
      it('should call printFailedReports', function() {
        configHandler.get.returns(true);

        testReportHandler.finalizeReport();

        expect(testReportHandler._printFailedReports.args).to.eql([
          [],
        ]);
      });
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
      it('should set the testReportHandler._report.status to \'pass\'', function() {
        testReportHandler.finalizeReport();

        expect(testReportHandler._report.status).to.equal('pass');
      });
    });

    describe('if testReportHandler._failedTestCount is not 0', function() {
      it('should keep the testReportHandler._report.status to \'fail\'', function() {
        testReportHandler._report.failedTestCount = 1;

        testReportHandler.finalizeReport();

        expect(testReportHandler._report.status).to.equal('fail');
      });
    });

    it('should call testReportHandler._handleTestReportSummary once with no params', function() {
      testReportHandler.finalizeReport();

      expect(testReportHandler._handleTestReportSummary.args).to.deep.equal([[]]);
    });

    it('should call testReportHandler.emit with the event\'testReportHandler.reportFinalized\'', function() {
      testReportHandler.finalizeReport();

      expect(testReportHandler.emit.args).to.deep.equal([
        [
          'testReportHandler.reportFinalized',
        ],
      ]);
    });
  });

  describe('_printFailedReports', function() {
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
      mockery.registerMock('../../util/config/config-handler.js', {});

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
      testReportHandler._handleTestReport = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    it('should call _handleTestReport for every failed report', function() {
      testReportHandler._failedReports = [
        'report1', 'report2',
      ];

      testReportHandler._printFailedReports();

      expect(testReportHandler._handleTestReport.args).to.eql([
        ['report1'],
        ['report2']
      ]);
    });
  });

  describe('_handleTestReport', function() {
    let testReportHandler;
    let Emitter;
    let configHandler;

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

      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get once with the \'reporter\'', function() {
      testReportHandler._handleTestReport({report: 'value'});

      expect(configHandler.get.args).to.deep.equal([['reporter']]);
    });

    describe('if configHandler.get returns \'basic\'', function() {
      it('should call testReportHandler.emit with the event \'testReportHandler.testReportReadyToPrint\'' +
        ' \'basic\', and the report', function() {
        configHandler.get.returns('basic');

        testReportHandler._handleTestReport({report: 'value'});

        expect(testReportHandler.emit.args).to.deep.equal([
          [
            'testReportHandler.testReportReadyToPrint',
            'basic',
            {report: 'value'},
          ],
        ]);
      });
    });
  });

  describe('_handleTestReportSummary', function() {
    let testReportHandler;
    let Emitter;
    let configHandler;

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

      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      testReportHandler = require('../../../../../lib/runner/test-runner/test-report-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get twice', function() {
      testReportHandler._handleTestReportSummary();

      expect(configHandler.get.callCount).to.equal(2);
    });

    it('should configHandler.get with \'reporter\'', function() {
      testReportHandler._handleTestReportSummary();

      expect(configHandler.get.args[0]).to.deep.equal(['reporter']);
    });

    describe('if configHandler.get returns \'basic\'', function() {
      it('should call testReportHandler.emit with the event \'testReportHandler.testReportReadyToPrint\'' +
        ' \'basic\', and the ._report', function() {
        configHandler.get.returns('basic');

        testReportHandler._handleTestReportSummary();

        expect(testReportHandler.emit.args).to.deep.equal([
          [
            'testReportHandler.testReportSummaryReadyToPrint',
            'basic',
            testReportHandler._report,
          ],
        ]);
      });
    });

    it('should call configHandler.get with  \'reportPath\'', function() {
      testReportHandler._handleTestReportSummary();

      expect(configHandler.get.args[1]).to.deep.equal(['reportPath']);
    });

    describe('if configHandler.get(\'reportPath\') returns a value', function() {
      it('should call configHandler.get a total of 3 times', function() {
        configHandler.get.returns(true);

        testReportHandler._handleTestReportSummary();

        expect(configHandler.get.callCount).to.equal(3);
      });

      it('should call configHandler.get with \'reportFormat\'', function() {
        configHandler.get.returns(true);

        testReportHandler._handleTestReportSummary();

        expect(configHandler.get.args[2]).to.deep.equal(['reportFormat']);
      });

      describe('if configHandler.get(\'reportFormat\') returns \'JSON\'', function() {
        it('should call testReportHandler.emit with the event \'testReportHandler.testReportSummaryReadyToWrite\'' +
          ' \'JSON\', and the report', function() {
          configHandler.get.returns('JSON');

          testReportHandler._handleTestReportSummary();

          expect(testReportHandler.emit.args).to.deep.equal([
            [
              'testReportHandler.testReportSummaryReadyToWrite',
              'JSON',
              testReportHandler._report,
            ],
          ]);
        });
      });

      describe('if configHandler.get(\'reportFormat\') returns \'actionJSON\'', function() {
        it('should call testReportHandler.emit with the event \'testReportHandler.testReportSummaryReadyToWrite\'' +
          ' \'actionJSON\', and the report', function() {
          configHandler.get.returns('actionJSON');

          testReportHandler._handleTestReportSummary();

          expect(testReportHandler.emit.args).to.deep.equal([
            [
              'testReportHandler.testReportSummaryReadyToWrite',
              'actionJSON',
              testReportHandler._report,
            ],
          ]);
        });
      });

      describe('if configHandler.get(\'reportFormat\') returns \'JUnit\'', function() {
        it('should call testReportHandler.emit with the event \'testReportHandler.testReportSummaryReadyToWrite\'' +
          ' \'JUnit\', and the report', function() {
          configHandler.get.returns('JUnit');

          testReportHandler._handleTestReportSummary();

          expect(testReportHandler.emit.args).to.deep.equal([
            [
              'testReportHandler.testReportSummaryReadyToWrite',
              'JUnit',
              testReportHandler._report,
            ],
          ]);
        });
      });
    });
  });
});
