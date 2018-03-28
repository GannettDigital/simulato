'use strict';

module.exports = {
    reportStartAction(action, actionConfig) {
        console.log(`##teamcity[testSuiteStarted name='${actionConfig.name} - ${actionConfig.actionName}']`);
    },
    reportEndStep(error, action, actionConfig, step, result) {
        console.log(`##teamcity[testStarted name='${step}']`);
        if (error && result === 'fail') {
            console.log(`##teamcity[testFailed name='${step}' message='${error.message}']`);
            console.log(`##teamcity[testFinished name='${step}']`);
            console
                .log(`##teamcity[testSuiteFinished name='${actionConfig.name} - ${actionConfig.actionName}']`);
        } else {
            console.log(`##teamcity[testFinished name='${step}']`);
        }
    },
    reportFinishedAction(action, actionConfig) {
        console.log(`##teamcity[testSuiteFinished name='${actionConfig.name} - ${actionConfig.actionName}']`);
    },
};
