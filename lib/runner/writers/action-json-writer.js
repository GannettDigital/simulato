'use strict';

const path = require('path');
const configHandler = require('../../util/config-handler.js');
const fs = require('fs');

module.exports = function(report) {
    let testPath = path.resolve(configHandler.get('testPath'));
    let obj = {};
    for (let rep of report.testReports) {
        let run = rep.testRuns[rep.testRuns.length -1];
        for (let action of run.report.actions) {
            if(!obj[`${action.component}.${action.action}`]) {
                obj[`${action.component}.${action.action}`] = [];
            }
            let testSteps = JSON.parse(fs.readFileSync(`${testPath}/${run.report.testName}`, 'utf8'));
            let customReport = {
                "automation":"Yes",
                "name": `${action.component}.${action.action}${obj[`${action.component}.${action.action}`].length}`,
                "automation-content":"",
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