'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/writers/j-unit-writer.js', function() {
  describe('write', function() {
    let path;
    let fs;
    let configHandler;
    let clock;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      path = {
        resolve: sinon.stub(),
      };
      configHandler = {
        get: sinon.stub(),
      };
      fs = {
        writeFileSync: sinon.stub(),
      };
      clock = sinon.useFakeTimers();

      mockery.registerMock('path', path);
      mockery.registerMock('fs', fs);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._createReportWithTestReports = sinon.stub();
      jUnitWriter._createReportWithTestRuns = sinon.stub();
      jUnitWriter._createReportWithActions = sinon.stub();
    });

    afterEach(function() {
      clock.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get twice', function() {
      jUnitWriter.write({});

      expect(configHandler.get.callCount).to.equal(2);
    });

    it(`should call configHandler.get with the string 'reportPath'`, function() {
      jUnitWriter.write({});

      expect(configHandler.get.args[0]).to.deep.equal(['reportPath']);
    });

    it(`should call configHandler.get with the string 'jUnitReportSpecificity'`, function() {
      jUnitWriter.write({});

      expect(configHandler.get.args[1]).to.deep.equal(['jUnitReportSpecificity']);
    });

    it('should call path.resolve once with the return value from configHandler.get ' +
      `and the current time in ms concatenated with '-test-report.xml`, function() {
      configHandler.get.onCall(0).returns('myPath');

      jUnitWriter.write({});

      expect(path.resolve.args).to.deep.equal([
        [
          'myPath',
          '0-test-report.xml',
        ],
      ]);
    });

    describe(`if jUnitReportSpecificity is equal to the string 'testReport'`, function() {
      it('should call jUnitWriter._createReportWithTestReports once with the passed in report', function() {
        configHandler.get.onCall(1).returns('testReport');

        jUnitWriter.write({report: 'myReport'});

        expect(jUnitWriter._createReportWithTestReports.args).to.deep.equal([
          [
            {report: 'myReport'},
          ],
        ]);
      });
    });

    describe(`if jUnitReportSpecificity is equal to the string 'testRun'`, function() {
      it('should call jUnitWriter._createReportWithTestRuns once with the passed in report', function() {
        configHandler.get.onCall(1).returns('testRun');

        jUnitWriter.write({report: 'myReport'});

        expect(jUnitWriter._createReportWithTestRuns.args).to.deep.equal([
          [
            {report: 'myReport'},
          ],
        ]);
      });
    });

    describe(`if jUnitReportSpecificity is equal to the string 'action'`, function() {
      it('should call jUnitWriter._createReportWithActions once with the passed in report', function() {
        configHandler.get.onCall(1).returns('action');

        jUnitWriter.write({report: 'myReport'});

        expect(jUnitWriter._createReportWithActions.args).to.deep.equal([
          [
            {report: 'myReport'},
          ],
        ]);
      });
    });

    describe(`if jUnitReportSpecificity is not equal to the strings 'testReport', 'testRun', or 'action'`, function() {
      it('should call jUnitWriter._createReportWithTestReports once with the passed in report', function() {
        configHandler.get.onCall(1).returns('invalidSpecificity');

        jUnitWriter.write({report: 'myReport'});

        expect(jUnitWriter._createReportWithTestReports.args).to.deep.equal([
          [
            {report: 'myReport'},
          ],
        ]);
      });
    });

    it('should call fs.writeFileSync once with the filePath and xmlReport', function() {
      path.resolve.returns('my-test-report.xml');
      configHandler.get.onCall(1).returns('action');
      jUnitWriter._createReportWithActions.returns('<some-xml></some-xml>');

      jUnitWriter.write({});

      expect(fs.writeFileSync.args).to.deep.equal([
        [
          'my-test-report.xml',
          '<some-xml></some-xml>',
        ],
      ]);
    });
  });

  describe('_createReportWithTestReports', function() {
    let testsuiteTag;
    let testcase;
    let report;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testsuiteTag = {
        ele: sinon.stub(),
        att: sinon.stub(),
        end: sinon.stub(),
      };
      testcase = {
        att: sinon.stub(),
      };
      testsuiteTag.ele.returns(testcase);
      report = {
        testReports: [
          {
            testName: '1234_test.json',
            testRuns: [
              {
                report: {
                  testName: '1234_test.json',
                },
              },
            ],
          },
        ],
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._createRootTag = sinon.stub().returns(testsuiteTag);
      jUnitWriter._setStatus = sinon.stub();
      jUnitWriter._setTimeFromTestRuns = sinon.stub();
      jUnitWriter._setFailureMessageIfExists = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call jUnitWriter._createRootTag once with the passed in report', function() {
      jUnitWriter._createReportWithTestReports(report);

      expect(jUnitWriter._createRootTag.args).to.deep.equal([[report]]);
    });

    describe('for each testReport', function() {
      it(`should call testsuiteTag.ele once with the string 'testcase'`, function() {
        jUnitWriter._createReportWithTestReports(report);

        expect(testsuiteTag.ele.args).to.deep.equal([['testcase']]);
      });

      it(`should call testcase.att once with the string 'name' and the testReport.testName`, function() {
        jUnitWriter._createReportWithTestReports(report);

        expect(testcase.att.args).to.deep.equal([['name', '1234_test.json']]);
      });

      it(`should call jUnitWrtier._setStatus once with the testReport and the testcase`, function() {
        jUnitWriter._createReportWithTestReports(report);

        expect(jUnitWriter._setStatus.args).to.deep.equal([[report.testReports[0], testcase]]);
      });

      it(`should call jUnitWrtier._setTimeFromTestRuns once with the testReport.testRuns and the testcase`, function() {
        jUnitWriter._createReportWithTestReports(report);

        expect(jUnitWriter._setTimeFromTestRuns.args).to.deep.equal([
          [
            [
              {
                report: {
                  testName: '1234_test.json',
                },
              },
            ],
            testcase,
          ],
        ]);
      });

      it(`should call jUnitWrtier._setFailureMessageIfExists once with the testReport, last test run ` +
        `failureCount and the testcase`, function() {
        report.testReports[0].testRuns.push({
          report: {
            testName: '1234_test.json',
          },
        });
        jUnitWriter._createReportWithTestReports(report);

        expect(jUnitWriter._setFailureMessageIfExists.args).to.deep.equal([
          [
            report.testReports[0],
            {
              report: {
                testName: '1234_test.json',
              },
            },
            0,
            testcase,
          ],
        ]);
      });
    });

    it(`should call testsuiteTag.att twice`, function() {
      jUnitWriter._createReportWithTestReports(report);

      expect(testsuiteTag.att.callCount).to.equal(2);
    });

    it(`should call testsuiteTag.att with the string 'tests' and the testCount`, function() {
      jUnitWriter._createReportWithTestReports(report);

      expect(testsuiteTag.att.args[0]).to.deep.equal(['tests', 1]);
    });

    it(`should call testsuiteTag.att with the string 'failures' and the failureCount`, function() {
      jUnitWriter._setFailureMessageIfExists.returns(2);

      jUnitWriter._createReportWithTestReports(report);

      expect(testsuiteTag.att.args[1]).to.deep.equal(['failures', 2]);
    });

    it(`should call testsuiteTag.end once with with a config object to pretty print`, function() {
      jUnitWriter._createReportWithTestReports(report);

      expect(testsuiteTag.end.args).to.deep.equal([[{pretty: true}]]);
    });
  });

  describe('_createReportWithTestRuns', function() {
    let testsuiteTag;
    let testcase;
    let report;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testsuiteTag = {
        ele: sinon.stub(),
        att: sinon.stub(),
        end: sinon.stub(),
      };
      testcase = {
        att: sinon.stub(),
      };
      testsuiteTag.ele.returns(testcase);
      report = {
        testReports: [
          {
            testRuns: [
              {
                report: {
                  testName: '1234_test.json',
                },
              },
            ],
          },
        ],
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._createRootTag = sinon.stub().returns(testsuiteTag);
      jUnitWriter._setStatus = sinon.stub();
      jUnitWriter._setTime = sinon.stub();
      jUnitWriter._setFailureMessageIfExists = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call jUnitWriter._createRootTag once with the passed in report', function() {
      jUnitWriter._createReportWithTestRuns(report);

      expect(jUnitWriter._createRootTag.args).to.deep.equal([[report]]);
    });

    describe('for each testRun', function() {
      it(`should call testsuiteTag.ele once with the string 'testcase'`, function() {
        jUnitWriter._createReportWithTestRuns(report);

        expect(testsuiteTag.ele.args).to.deep.equal([['testcase']]);
      });

      it(`should call testcase.att once with the string 'name' and the testRun.report.testName`, function() {
        jUnitWriter._createReportWithTestRuns(report);

        expect(testcase.att.args).to.deep.equal([['name', '1234_test.json']]);
      });

      it(`should call jUnitWrtier._setStatus once with the testRun.report and the testcase`, function() {
        jUnitWriter._createReportWithTestRuns(report);

        expect(jUnitWriter._setStatus.args).to.deep.equal([
          [
            {
              testName: '1234_test.json',
            },
            testcase,
          ],
        ]);
      });

      describe('if testRun.report.time is set', function() {
        it(`should call jUnitWriter._setTime once with the testRun.report and the testcase`, function() {
          report.testReports[0].testRuns[0].report.time = [1, 423411];

          jUnitWriter._createReportWithTestRuns(report);

          expect(jUnitWriter._setTime.args).to.deep.equal([
            [
              {
                testName: '1234_test.json',
                time: [1, 423411],
              },
              testcase,
            ],
          ]);
        });
      });

      describe('if testRun.report.time is not set', function() {
        it('should not call jUnitWriter._setTime', function() {
          jUnitWriter._createReportWithTestRuns(report);

          expect(jUnitWriter._setTime.callCount).to.equal(0);
        });
      });

      it(`should call jUnitWrtier._setFailureMessageIfExists once with the testRun.report, testRun ` +
        `failureCount and the testcase`, function() {
        jUnitWriter._createReportWithTestRuns(report);

        expect(jUnitWriter._setFailureMessageIfExists.args).to.deep.equal([
          [
            {
              testName: '1234_test.json',
            },
            {
              report: {
                testName: '1234_test.json',
              },
            },
            0,
            testcase,
          ],
        ]);
      });
    });

    it(`should call testsuiteTag.att twice`, function() {
      jUnitWriter._createReportWithTestRuns(report);

      expect(testsuiteTag.att.callCount).to.equal(2);
    });

    it(`should call testsuiteTag.att with the string 'tests' and the testCount`, function() {
      jUnitWriter._createReportWithTestRuns(report);

      expect(testsuiteTag.att.args[0]).to.deep.equal(['tests', 1]);
    });

    it(`should call testsuiteTag.att with the string 'failures' and the failureCount`, function() {
      jUnitWriter._setFailureMessageIfExists.returns(2);

      jUnitWriter._createReportWithTestRuns(report);

      expect(testsuiteTag.att.args[1]).to.deep.equal(['failures', 2]);
    });

    it(`should call testsuiteTag.end once with with a config object to pretty print`, function() {
      jUnitWriter._createReportWithTestRuns(report);

      expect(testsuiteTag.end.args).to.deep.equal([[{pretty: true}]]);
    });
  });

  describe('_createReportWithActions', function() {
    let testsuiteTag;
    let testcase;
    let report;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testsuiteTag = {
        ele: sinon.stub(),
        att: sinon.stub(),
        end: sinon.stub(),
      };
      testcase = {
        att: sinon.stub(),
      };
      testsuiteTag.ele.returns(testcase);
      report = {
        testReports: [
          {
            testRuns: [
              {
                report: {
                  testName: '1234_test.json',
                  actions: [
                    {
                      component: 'myComponent',
                      action: 'MY_ACTION',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._createRootTag = sinon.stub().returns(testsuiteTag);
      jUnitWriter._setStatus = sinon.stub();
      jUnitWriter._setTime = sinon.stub();
      jUnitWriter._setFailureMessageIfExists = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call jUnitWriter._createRootTag once with the passed in report', function() {
      jUnitWriter._createReportWithActions(report);

      expect(jUnitWriter._createRootTag.args).to.deep.equal([[report]]);
    });

    describe('if the testRun.report.actions is not an array', function() {
      it('should not call testsuiteTag.ele', function() {
        report.testReports[0].testRuns[0].report.actions = 'Not an Array';

        jUnitWriter._createReportWithActions(report);

        expect(testsuiteTag.ele.callCount).to.equal(0);
      });
    });

    describe('for each action', function() {
      it(`should call testsuiteTag.ele once with the string 'testcase'`, function() {
        jUnitWriter._createReportWithActions(report);

        expect(testsuiteTag.ele.args).to.deep.equal([['testcase']]);
      });

      it(`should call testcase.att once with the string 'name' and the action's component and action name`, function() {
        jUnitWriter._createReportWithActions(report);

        expect(testcase.att.args).to.deep.equal([['name', '1234_test.json:myComponent.MY_ACTION']]);
      });

      it(`should call jUnitWrtier._setStatus once with the action and the testcase`, function() {
        jUnitWriter._createReportWithActions(report);

        expect(jUnitWriter._setStatus.args).to.deep.equal([
          [
            {
              component: 'myComponent',
              action: 'MY_ACTION',
            },
            testcase,
          ],
        ]);
      });

      it(`should call jUnitWriter._setTime once with the action and the testcase`, function() {
        jUnitWriter._createReportWithActions(report);

        expect(jUnitWriter._setTime.args).to.deep.equal([
          [
            {
              component: 'myComponent',
              action: 'MY_ACTION',
            },
            testcase,
          ],
        ]);
      });

      it(`should call jUnitWrtier._setFailureMessageIfExists once with the action, testRun ` +
        `failureCount and the testcase`, function() {
        jUnitWriter._createReportWithActions(report);

        expect(jUnitWriter._setFailureMessageIfExists.args).to.deep.equal([
          [
            {
              component: 'myComponent',
              action: 'MY_ACTION',
            },
            {
              report: {
                testName: '1234_test.json',
                actions: [
                  {
                    component: 'myComponent',
                    action: 'MY_ACTION',
                  },
                ],
              },
            },
            0,
            testcase,
          ],
        ]);
      });
    });

    it(`should call testsuiteTag.att twice`, function() {
      jUnitWriter._createReportWithActions(report);

      expect(testsuiteTag.att.callCount).to.equal(2);
    });

    it(`should call testsuiteTag.att with the string 'tests' and the testCount`, function() {
      jUnitWriter._createReportWithActions(report);

      expect(testsuiteTag.att.args[0]).to.deep.equal(['tests', 1]);
    });

    it(`should call testsuiteTag.att with the string 'failures' and the failureCount`, function() {
      jUnitWriter._setFailureMessageIfExists.returns(2);

      jUnitWriter._createReportWithActions(report);

      expect(testsuiteTag.att.args[1]).to.deep.equal(['failures', 2]);
    });

    it(`should call testsuiteTag.end once with with a config object to pretty print`, function() {
      jUnitWriter._createReportWithActions(report);

      expect(testsuiteTag.end.args).to.deep.equal([[{pretty: true}]]);
    });
  });

  describe('_getFailureMessage', function() {
    let testRun;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testRun = {
        report: {
          testName: '1234_test.json',
          actions: [
            {
              component: 'myComponent',
              action: 'MY_ACTION',
              steps: {
                preconditions: {
                  error: {
                    message: 'A bad error',
                  },
                },
              },
            },
          ],
          errorLocation: {
            actionIndex: 0,
            step: 'preconditions',
          },
        },
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if testRun.report.errorLocation is truthy', function() {
      it(`should return error message at the action's index that corresponds to the errorLocation index`, function() {
        const result = jUnitWriter._getFailureMessage(testRun);

        expect(result).to.equal('A bad error');
      });
    });

    describe('if testRun.report.errorLocation is falsy', function() {
      it('should return testRun.stdErr', function() {
        testRun.report.actions = [];
        testRun.report.errorLocation = undefined;
        testRun.stdErr = 'Info in standard error';

        const result = jUnitWriter._getFailureMessage(testRun);

        expect(result).to.equal('Info in standard error');
      });
    });
  });

  describe('_createRootTag', function() {
    let testsuiteTag;
    let report;
    let xmlBuilder;
    let clock;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      xmlBuilder = {
        create: sinon.stub(),
      };
      testsuiteTag = {
        att: sinon.stub(),
      };
      xmlBuilder.create.returns(testsuiteTag);
      report = {
        status: 'pass',
      };
      clock = sinon.useFakeTimers();

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', xmlBuilder);

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._setTime = sinon.stub();
    });

    afterEach(function() {
      clock.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it(`should call xmlBuilder.create once with the string 'testsuite'`, function() {
      jUnitWriter._createRootTag(report);

      expect(xmlBuilder.create.args).to.deep.equal([['testsuite']]);
    });

    it(`should call testsuiteTag twice`, function() {
      jUnitWriter._createRootTag(report);

      expect(testsuiteTag.att.callCount).to.equal(2);
    });

    it(`should call testsuiteTag.att with the string 'timestamp', and the current time in ISO format`, function() {
      jUnitWriter._createRootTag(report);

      expect(testsuiteTag.att.args[0]).to.deep.equal(['timestamp', '1970-01-01T00:00:00.000Z']);
    });

    it(`should call testsuiteTag.att with the strings 'timestamp' and 'Simulato Tests'`, function() {
      jUnitWriter._createRootTag(report);

      expect(testsuiteTag.att.args[1]).to.deep.equal(['name', 'Simulato Tests']);
    });

    it(`should call jUnitWriter._setTime with the passed report and testsuiteTag`, function() {
      jUnitWriter._createRootTag(report);

      expect(jUnitWriter._setTime.args).to.deep.equal([
        [
          {status: 'pass'},
          testsuiteTag,
        ],
      ]);
    });

    it('should return the created testsuiteTag', function() {
      const result = jUnitWriter._createRootTag(report);

      expect(result).to.deep.equal(testsuiteTag);
    });
  });

  describe('_setStatus', function() {
    let testcase;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testcase = {
        att: sinon.stub(),
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe(`if datum.status is equal to the string 'fail'`, function() {
      it(`should catll testcase.att once with the strings 'status' and 'fail'`, function() {
        const datum = {status: 'fail'};

        jUnitWriter._setStatus(datum, testcase);

        expect(testcase.att.args).to.deep.equal([['status', 'fail']]);
      });
    });

    describe(`if datum.status is equal to the string 'rerun'`, function() {
      it(`should catll testcase.att once with the strings 'status' and 'fail'`, function() {
        const datum = {status: 'rerun'};

        jUnitWriter._setStatus(datum, testcase);

        expect(testcase.att.args).to.deep.equal([['status', 'fail']]);
      });
    });

    describe(`if datum.status not equal to the strings 'fail' or 'rerun'`, function() {
      it(`should catll testcase.att once with the strings 'status' and datum.status`, function() {
        const datum = {status: 'pass'};

        jUnitWriter._setStatus(datum, testcase);

        expect(testcase.att.args).to.deep.equal([['status', 'pass']]);
      });
    });
  });

  describe('_setFailureMessageIfExists', function() {
    let testcase;
    let failure;
    let testRun;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      testcase = {
        ele: sinon.stub(),
      };
      failure = {
        att: sinon.stub(),
      };
      testcase.ele.returns(failure);
      testRun = {
        testName: '1234_test.json',
        actions: [],
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');

      jUnitWriter._getFailureMessage = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe(`if datum.status equals the string 'fail'`, function() {
      it(`should call testcase.ele once with the string 'failure'`, function() {
        const datum = {status: 'fail'};

        jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(testcase.ele.args).to.deep.equal([['failure']]);
      });

      it(`should call failure.att once with the string 'message' and result ` +
        `of the call to jUnitWriter._getFailureMessage`, function() {
        const datum = {status: 'fail'};
        jUnitWriter._getFailureMessage.returns('myFailureMessage');

        jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(failure.att.args).to.deep.equal([['message', 'myFailureMessage']]);
      });

      it('should return the passed in failureCount incremented by 1', function() {
        const datum = {status: 'fail'};

        const result = jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(result).to.equal(4);
      });
    });

    describe(`if datum.status equals the string 'rerun'`, function() {
      it(`should call testcase.ele once with the string 'failure'`, function() {
        const datum = {status: 'rerun'};

        jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(testcase.ele.args).to.deep.equal([['failure']]);
      });

      it(`should call failure.att once with the string 'message' and result ` +
        `of the call to jUnitWriter._getFailureMessage`, function() {
        const datum = {status: 'rerun'};
        jUnitWriter._getFailureMessage.returns('myFailureMessage');

        jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(failure.att.args).to.deep.equal([['message', 'myFailureMessage']]);
      });

      it('should return the passed in failureCount incremented by 1', function() {
        const datum = {status: 'rerun'};

        const result = jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(result).to.equal(4);
      });
    });

    describe(`if datum.status is not equal to the strings 'fail' or 'rerun'`, function() {
      it('should return the passed in failureCount unchanged', function() {
        const datum = {status: 'pass'};

        const result = jUnitWriter._setFailureMessageIfExists(datum, testRun, 3, testcase);

        expect(result).to.equal(3);
      });
    });
  });

  describe('_setTime', function() {
    let xmlTag;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      xmlTag = {
        att: sinon.stub(),
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe(`when the datum's seconds is 0 and nanoseconds is 341324123134`, function() {
      it(`should call xmlTag.att once with the string 'time' and the converted hrtime`, function() {
        const datum = {time: [0, 341324123134]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '341.324123134']]);
      });
    });

    describe(`when the datum's seconds is 0 and nanoseconds is 324123134`, function() {
      it(`should call xmlTag.att once with the strings 'time' and the converted hrtime`, function() {
        const datum = {time: [0, 324123134]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '0.324123134']]);
      });
    });

    describe(`when the datum's seconds is ${Number.MAX_SAFE_INTEGER} and nanoseconds ` +
      `is ${Number.MAX_SAFE_INTEGER}`, function() {
      it(`should call xmlTag.att once with the strings 'time' and the converted hrtime`, function() {
        const datum = {time: [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', Number.MAX_SAFE_INTEGER.toString()]]);
      });
    });

    describe(`when the datum's seconds is 3 and nanoseconds is 44234`, function() {
      it(`should call xmlTag.att once with the strings 'time' and the converted hrtime`, function() {
        const datum = {time: [3, 44234]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '3.000044234']]);
      });
    });

    describe(`when the datum's seconds is 3234 and nanoseconds is 576568899`, function() {
      it(`should call xmlTag.att once with the strings 'time' and the converted hrtime`, function() {
        const datum = {time: [3234, 576568899]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '3234.576568899']]);
      });
    });

    describe(`when the datum's seconds is 0 and nanoseconds is 0`, function() {
      it(`should call xmlTag.att once with the strings 'time' and the converted hrtime`, function() {
        const datum = {time: [0, 0]};

        jUnitWriter._setTime(datum, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '0']]);
      });
    });
  });

  describe('_setTimeFromTestRuns', function() {
    let xmlTag;
    let jUnitWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/j-unit-writer.js');

      xmlTag = {
        att: sinon.stub(),
      };

      mockery.registerMock('path', {});
      mockery.registerMock('fs', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('xmlbuilder', {});

      jUnitWriter = require('../../../../../lib/runner/writers/j-unit-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if there are no testRuns with time', function() {
      it(`should call xmlTag.att with the string 'time' and the converted hrtime`, function() {
        const testRuns = [
          {report: {}},
          {report: {}},
        ];

        jUnitWriter._setTimeFromTestRuns(testRuns, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '0']]);
      });
    });

    describe(`if two testRuns have seconds and nanoseconds as ${Number.MAX_SAFE_INTEGER}`, function() {
      it(`should call xmlTag.att with the string 'time' and the converted hrtime`, function() {
        const testRuns = [
          {report: {time: [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]}},
          {report: {time: [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]}},
        ];

        jUnitWriter._setTimeFromTestRuns(testRuns, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', Number.MAX_SAFE_INTEGER.toString()]]);
      });
    });

    describe(`if testRuns has seconds and seconds as all valid values`, function() {
      it(`should call xmlTag.att with the string 'time' and the converted hrtime`, function() {
        const testRuns = [
          {report: {time: [0, 341324123134]}},
        ];

        jUnitWriter._setTimeFromTestRuns(testRuns, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '341.3241']]);
      });
    });

    describe(`if testRuns have seconds and nanoseconds as all valid values`, function() {
      it(`should call xmlTag.att with the string 'time' and the converted hrtime`, function() {
        const testRuns = [
          {report: {time: [3, 44234]}},
          {report: {time: [3234, 576568899]}},
          {report: {time: [0, 0]}},
        ];

        jUnitWriter._setTimeFromTestRuns(testRuns, xmlTag);

        expect(xmlTag.att.args).to.deep.equal([['time', '3237.5766']]);
      });
    });
  });
});
