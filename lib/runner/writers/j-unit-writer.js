'use strict';

const xmlBuilder = require('xmlbuilder');
const configHandler = require('../../util/config/config-handler.js');
const fs = require('fs');
const path = require('path');

let jUnitWriter;
module.exports = jUnitWriter = {
  write(report) {
    let filePath = path.resolve(configHandler.get('reportPath'), `${Date.now()}-test-report.xml`);
    let jUnitReportSpecificity = configHandler.get('jUnitReportSpecificity');

    let xmlReport;
    switch (jUnitReportSpecificity) {
      case 'testReport':
        xmlReport = jUnitWriter._createReportWithTestReports(report);
        break;
      case 'testRun':
        xmlReport = jUnitWriter._createReportWithTestRuns(report);
        break;
      case 'action':
        xmlReport = jUnitWriter._createReportWithActions(report);
        break;
      default:
        xmlReport = jUnitWriter._createReportWithTestReports(report);
        break;
    }

    fs.writeFileSync(filePath, xmlReport);
  },
  _createReportWithTestReports(report) {
    let testCount = 0;
    let failureCount = 0;

    let testsuiteTag = jUnitWriter._createRootTag(report);

    for (let testReport of report.testReports) {
      let testcase = testsuiteTag.ele('testcase');
      testCount++;

      testcase.att('name', testReport.testName);
      jUnitWriter._setStatus(testReport, testcase);
      jUnitWriter._setTimeFromTestRuns(testReport.testRuns, testcase);

      failureCount = jUnitWriter._setFailureMessageIfExists(
          testReport,
          testReport.testRuns[testReport.testRuns.length - 1],
          failureCount,
          testcase
      );
    }

    testsuiteTag.att('tests', testCount);
    testsuiteTag.att('failures', failureCount);

    return testsuiteTag.end({pretty: true});
  },
  _createReportWithTestRuns(report) {
    let testCount = 0;
    let failureCount = 0;

    let testsuiteTag = jUnitWriter._createRootTag(report);

    for (let testReport of report.testReports) {
      for (let testRun of testReport.testRuns) {
        let testcase = testsuiteTag.ele('testcase');
        testCount++;

        testcase.att('name', testRun.report.testName);
        jUnitWriter._setStatus(testRun.report, testcase);
        if (testRun.report.time) {
          jUnitWriter._setTime(testRun.report, testcase);
        }

        failureCount = jUnitWriter._setFailureMessageIfExists(testRun.report, testRun, failureCount, testcase);
      }
    }

    testsuiteTag.att('tests', testCount);
    testsuiteTag.att('failures', failureCount);

    return testsuiteTag.end({pretty: true});
  },
  _createReportWithActions(report) {
    let testCount = 0;
    let failureCount = 0;

    let testsuiteTag = jUnitWriter._createRootTag(report);

    for (let testReport of report.testReports) {
      for (let testRun of testReport.testRuns) {
        if (Array.isArray(testRun.report.actions)) {
          for (let action of testRun.report.actions) {
            let testcase = testsuiteTag.ele('testcase');
            testCount++;

            testcase.att('name', `${action.component}.${action.action}`);
            jUnitWriter._setStatus(action, testcase);
            jUnitWriter._setTime(action, testcase);

            failureCount = jUnitWriter._setFailureMessageIfExists(action, testRun, failureCount, testcase);
          }
        }
      }
    }

    testsuiteTag.att('tests', testCount);
    testsuiteTag.att('failures', failureCount);

    return testsuiteTag.end({pretty: true});
  },
  _getFailureMessage(testRun) {
    let message;
    if (testRun.report.errorLocation) {
      let errorIndex = testRun.report.errorLocation.actionIndex;
      let step = testRun.report.errorLocation.step;
      message = testRun.report.actions[errorIndex].steps[step].error.message;
    } else {
      message = testRun.stdErr;
    }
    return message;
  },
  _createRootTag(report) {
    let testsuiteTag = xmlBuilder.create('testsuite');
    let currentTime = new Date();
    testsuiteTag.att('timestamp', currentTime.toISOString());
    testsuiteTag.att('name', 'Simulato Tests');
    jUnitWriter._setTime(report, testsuiteTag);
    return testsuiteTag;
  },
  _setStatus(datum, testcase) {
    if (datum.status === 'fail' || datum.status === 'rerun') {
      testcase.att('status', 'fail');
    } else {
      testcase.att('status', datum.status);
    }
  },
  _setFailureMessageIfExists(datum, testRun, failureCount, testcase) {
    if (datum.status === 'fail' || datum.status === 'rerun') {
      let failure = testcase.ele('failure');
      failure.att('message', jUnitWriter._getFailureMessage(testRun));
      failureCount++;
      return failureCount;
    }
    return failureCount;
  },
  _setTime(datum, xmlTag) {
    let seconds = datum.time[0] + (datum.time[1] / 1000000000);
    if (seconds > Number.MAX_SAFE_INTEGER) {
      xmlTag.att('time', Number.MAX_SAFE_INTEGER.toString());
    } else {
      xmlTag.att('time', seconds.toString());
    }
  },
  _setTimeFromTestRuns(testRuns, xmlTag) {
    let seconds = 0;
    let secondsDecimal = 0;

    for (let testRun of testRuns) {
      if (testRun.report.time) {
        seconds += Number.parseInt(testRun.report.time[0]);
        secondsDecimal += Number.parseFloat((testRun.report.time[1] / 1000000000).toFixed(4));
      }
    }

    let totalTime = seconds + secondsDecimal;
    if (totalTime > Number.MAX_SAFE_INTEGER) {
      xmlTag.att('time', Number.MAX_SAFE_INTEGER.toString());
    } else {
      xmlTag.att('time', totalTime.toString());
    }
  },
};
