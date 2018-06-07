'use strict';

module.exports = {
    testPath: './test/acceptance/tests',
    components: './test/acceptance/components',
    reportPath: './test/acceptance/tests',
    outputPath: './test/acceptance/tests',
    planner: {
        algorithm: 'forwardStateSpaceSearchHeuristic',
    },
    rerunFailedTests: 1,
};
