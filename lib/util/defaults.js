'use strict';

module.exports = {
  componentPath: `${process.cwd()}/components`,
  outputPath: process.cwd(),
  testPath: `${process.cwd()}/tests`,
  technique: 'actionFocused',
  reporter: 'basic',
  parallelism: 20,
  testDelay: 200,
  rerunFailedTests: 0,
  plannerAlgorithm: 'forwardStateSpaceSearchHeuristic',
};
