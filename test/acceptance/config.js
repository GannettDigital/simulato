'use strict';

module.exports = {
    testPath: './test/acceptance/tests',
    componentPath: './test/acceptance/components',
    reportPath: './test/acceptance/tests',
    outputPath: './test/acceptance/tests',
    plannerAlgorithm: 'forwardStateSpaceSearchHeuristic',
    rerunFailedTests: 1,
    sauceCapabilities: {
        username: 'SOME USERNAME',
        accesskey: 'some key',
    },
};
