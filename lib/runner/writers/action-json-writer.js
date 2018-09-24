'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../../util/config-handler.js');

let actionJsonWriter;

module.exports = actionJsonWriter = {
  _testData: {},
  write(report) {
    let testFolderPath = path.resolve(configHandler.get('testPath'));

    for (let rep of report.testReports) {
      let run = rep.testRuns[rep.testRuns.length -1];
      let absoluteTestPath = `${testFolderPath}/${run.report.testName}`;
      let testJsonString = fs.readFileSync(absoluteTestPath, 'utf8');

      for (let action of run.report.actions) {
        let actionName = `${action.component}.${action.action}`;
        let testData = actionJsonWriter._getActionTestData(actionName);

        testData.count++;
        testData.averageTime += action.time[0] + (action.time[1] * .000000001);

        let error = actionJsonWriter._checkActionForError(action, testData);
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

    for (let failure of test.failures) {
      reportNotes += `\nError: ${JSON.stringify(failure.error)}\n\nTest: ${failure.test}`;
    }
    return reportNotes;
  },
  _writeReports() {
    for (let [actionName, test] of Object.entries(actionJsonWriter._testData)) {
      actionJsonWriter._writeReport(actionName, test);
    }
  },
  _writeReport(actionName, test) {
    let notes = actionJsonWriter._createNotes(test);
    let customReport = [{
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

    let customReportPath = path.resolve(configHandler.get('reportPath'), `${actionName}.json`);
    fs.writeFileSync(customReportPath, JSON.stringify(customReport));
  },
  _checkActionForError(action, testData) {
    if (action.status === 'fail') {
      testData.status = 'fail';
      let steps = ['preconditions', 'perform', 'effects'];
      for (let step of steps) {
        let error = actionJsonWriter._checkStepForError(action, step);
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
