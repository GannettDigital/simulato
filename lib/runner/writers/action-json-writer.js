'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../../util/config/config-handler.js');

let actionJsonWriter;

module.exports = actionJsonWriter = {
  _testData: {},
  write(report) {
    const testFolderPath = path.resolve(configHandler.get('testPath'));

    for (const rep of report.testReports) {
      const run = rep.testRuns[rep.testRuns.length -1];
      const absoluteTestPath = `${testFolderPath}/${run.report.testName}`;
      const testJsonString = fs.readFileSync(absoluteTestPath, 'utf8');

      for (const action of run.report.actions) {
        const actionName = `${action.component}.${action.action}`;
        const testData = actionJsonWriter._getActionTestData(actionName);

        testData.count++;
        testData.averageTime += action.time[0] + (action.time[1] * .000000001);

        const error = actionJsonWriter._checkActionForError(action, testData);
        if (error) {
          testData.failures.push({
            error,
            test: testJsonString,
          });
        }
      }
    };
    return actionJsonWriter._writeReports();
  },
  _getActionTestData(actionName) {
    if (!actionJsonWriter._testData[actionName]) {
      actionJsonWriter._testData[actionName] = {
        count: 0,
        failures: [],
        averageTime: 0,
        status: 'pass',
      };
    }
    return actionJsonWriter._testData[actionName];
  },
  _createNotes(test) {
    let reportNotes = `Run Count: ${test.count}\nFail Count: ${test.failures.length}\nFailures:`;

    for (const failure of test.failures) {
      reportNotes += `\nError: ${JSON.stringify(failure.error)}\n\nTest: ${failure.test}`;
    }
    return reportNotes;
  },
  _writeReports() {
    for (const [actionName, test] of Object.entries(actionJsonWriter._testData)) {
      actionJsonWriter._writeReport(actionName, test);
    }
  },
  _writeReport(actionName, test) {
    const notes = actionJsonWriter._createNotes(test);
    const customReport = [{
      'automation': 'Yes',
      'name': actionName,
      'automation-content': actionName,
      'description': '',
      'precondition': '',
      'priority': '',
      'note': notes,
      'execution-status': test.status,
      'test-steps': [
        {
          'description': '',
          'expected': '',
          'actual': '',
          'step-status': '',
        },
      ],
      'execution-time': `${test.averageTime / test.count}`,
    }];

    const customReportPath = path.resolve(configHandler.get('reportPath'), `${actionName}.json`);
    fs.writeFileSync(customReportPath, JSON.stringify(customReport));
  },
  _checkActionForError(action, testData) {
    if (action.status === 'fail') {
      testData.status = 'fail';
      const steps = ['preconditions', 'perform', 'effects'];
      for (const step of steps) {
        const error = actionJsonWriter._checkStepForError(action, step);
        if (error) {
          return error;
        }
      }
    }
    return null;
  },
  _checkStepForError(action, step) {
    if (action.steps[step] && action.steps[step].status === 'fail') {
      return action.steps[step].error;
    }
    return null;
  },
};
