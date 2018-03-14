'use strict';

const symbols = {
    pass: '✓',
    fail: '❌',
};

module.exports = {
    reportStartAction(action, actionConfig) {
        console.log(`${actionConfig.instanceName} - ${actionConfig.actionName}`);
    },
    reportEndStep(error, action, actionConfig, step, result) {
        console.log(`\t${symbols[result]} ${step}`);
    },
};
