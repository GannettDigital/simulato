
'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/reporters/basic-reporter.js', function() {
  describe.only('printReportSummary', function() {
    let basicReporter;
    let report;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/reporters/basic-reporter.js');

      sinon.spy(console, 'log');

      report = {
        status: 'pass',
        testCount: 3,
        failedTestCount: 0,
        time: [20, 234],
        testReports: [],
      };

      basicReporter = require('../../../../../lib/runner/reporters/basic-reporter.js');
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call console.log with the title for the test summary', function() {
      basicReporter.printReportSummary(report);

      expect(console.log.args[0]).to.deep.equal([
        '\n*** Final Aggregate Test Summary ***',
      ]);
    });

    it('should call console.log to say total tests run using testCount', function() {
      basicReporter.printReportSummary(report);

      expect(console.log.args[1]).to.deep.equal([
        'Total tests run: 3',
      ]);
    });

    it('should call console.log to say total tests passed using testCount & failedTestCount', function() {
      basicReporter.printReportSummary(report);

      expect(console.log.args[2]).to.deep.equal([
        'Tests passed: 3',
      ]);
    });

    it('should call console.log to say total tests failed using failedTestCount', function() {
      basicReporter.printReportSummary(report);

      expect(console.log.args[3]).to.deep.equal([
        'Tests failed: 0',
      ]);
    });

    it('should call console.log to say run time using time array', function() {
      basicReporter.printReportSummary(report);

      expect(console.log.args[4]).to.deep.equal([
        'Run time: 20.234 seconds\n',
      ]);
    });

    describe('if the report.status is set to \'fail\'', function() {
      it('should call console.log to say Failed tests:', function() {
        report.status = 'fail';

        basicReporter.printReportSummary(report);

        expect(console.log.args[5]).to.deep.equal([
          `\x1b[31mFailed Tests:\n\x1b[0m`,
        ]);
      });

      describe('for each testReport of the passed in report.testReports', function() {
        describe('if the testReport.status equals \'fail\'', function() {
          describe('if the testReport.errorLocation property is truthy', function() {
            it('should call console.log to print out an error report', function() {
              report.status = 'fail';
              report.testReports[0] = {
                testName: 'testName',
                status: 'fail',
                errorLocation: {
                  actionIndex: 0,
                  step: 'preconditions',
                },
                actions: [
                  {
                    steps: {
                      preconditions: {
                        error: {
                          name: 'ERROR NAME',
                          message: 'ERROR MESSAGE',
                        },
                      },
                    },
                  },
                ],
              };

              basicReporter.printReportSummary(report);

              expect(console.log.args[6]).to.deep.equal([
                `\u001b[31mtestName: ERROR NAME: ERROR MESSAGE\u001b[0m\n`,
              ]);
            });
          });

          describe('if the testReport.errorLocation property is falsy', function() {
            it('should call console.log to say no report received and to check stdErr', function() {
              report.status = 'fail';
              report.testReports[0] = {
                testName: 'testName',
                status: 'fail',
              };

              basicReporter.printReportSummary(report);

              expect(console.log.args[6]).to.deep.equal([
                `\x1b[31mtestName: No report received from child process check stdErr\x1b[0m\n`,
              ]);
            });
          });
        });

        describe('if the testReport.status does NOT equal \'fail\'', function() {
          it('should only call console.log 6 times', function() {
            report.status = 'fail';
            report.testReports[0] = {
              status: 'pass',
            };

            basicReporter.printReportSummary(report);

            expect(console.log.callCount).to.equal(6);
          });
        });
      });
    });

    // describe('for each test report', function() {
    //   describe('if there is an error', function() {
    //     it('should change the process.exitCode to 1', function() {
    //       printOutput._printTestSummary();

    //       expect(process.exitCode).to.equal(1);
    //     });
    //     it('should call console.log 13 times if there are 2 failed tests'
    //       + 'each with 1 failed action having 1 failed step', function() {
    //         printOutput._printTestSummary();

    //         expect(console.log.callCount).to.equal(13);
    //       });

    //     it('should call console.log to the testName of the failed action', function() {
    //       printOutput._printTestSummary();

    //       expect(console.log.args[5]).to.deep.equal([
    //         `${'Test 1'}:`,
    //       ]);
    //     });

    //     it('should call console.log to say the failed action using instanceName and actioName', function() {
    //       printOutput._printTestSummary();

    //       expect(console.log.args[6]).to.deep.equal([
    //         `\tFailed Action: ${'component1'} - ${'actionX'}`,
    //       ]);
    //     });

    //     it('should call console.log to say the failedStep', function() {
    //       printOutput._printTestSummary();

    //       expect(console.log.args[7]).to.deep.equal([
    //         `\t\tStep: ${'effects'}`,
    //       ]);
    //     });

    //     it('should call console.log to say the Error name', function() {
    //       printOutput._printTestSummary();

    //       expect(console.log.args[8]).to.deep.equal([
    //         `\t\t\tError: ${'My Error'}`,
    //       ]);
    //     });
    //   });

    //   describe('when there are no failed tests', function() {
    //     it('should not change the process.exitCode', function() {
    //       delete printOutput._testSummary.testReports[0].error;
    //       delete printOutput._testSummary.testReports[1].error;

    //       printOutput._printTestSummary();

    //       expect(process.exitCode).to.equal(0);
    //     });
    //     it('should only call console.log 5 times', function() {
    //       delete printOutput._testSummary.testReports[0].error;
    //       delete printOutput._testSummary.testReports[1].error;

    //       printOutput._printTestSummary();

    //       expect(console.log.callCount).to.equal(5);
    //     });
    //   });
    // });
  });
});
