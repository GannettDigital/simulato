'use strict';

const symbols = {
    pass: '✓',
    fail: '❌',
};

module.exports = {
    reportStartAction(action, actionConfig) {
        console.log(`${actionConfig.name} - ${actionConfig.actionName}`);
    },
    reportEndStep(error, action, actionConfig, step, result) {
        console.log(`\t${symbols[result]} ${step}`);
    },
};
