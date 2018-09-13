'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../../util/config-handler.js');

module.exports = function(report) {
    let testFolderPath = path.resolve(configHandler.get('testPath'));
    let obj = {};
    for (let rep of report.testReports) {
        let run = rep.testRuns[rep.testRuns.length -1];
        let absoluteTestPath = `${testFolderPath}/${run.report.testName}`;
        let testSteps = JSON.parse(fs.readFileSync(absoluteTestPath, 'utf8'));
        for (let action of run.report.actions) {
            if(!obj[`${action.component}.${action.action}`]) {
                obj[`${action.component}.${action.action}`] = [];
            }

            let customReport = {
                "automation":"Yes",
                "name": `${action.component}.${action.action}`,
                "automation-content": `sample#automation.content_${obj[`${action.component}.${action.action}`].length}`,
                "description":"",
                "precondition":"",
                "priority":"",
                "note": testSteps,
                "execution-status": action.status,
                "test-steps":[  
                    {  
                        "description":"",
                        "expected":"",
                        "actual":"",
                        "step-status":""
                    }
                ],
                "execution-time": action.time
            }
            obj[`${action.component}.${action.action}`].push(customReport);
        }
  };
  for (let [actionName, actionReport] of Object.entries(obj)) {
    let customReportPath = path.resolve(configHandler.get('reportPath'), `${actionName}.json`);
    fs.writeFileSync(customReportPath, JSON.stringify(actionReport));
  }
};