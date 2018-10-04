'use strict';

module.exports = {
  componentPath: `${process.cwd()}/components`,
  outputPath: process.cwd(),
  testPath: `${process.cwd()}/tests`,
  configFile: `${process.cwd()}/simulato-config.js`,
  reporter: 'basic',
  reportFormat: 'JSON',
  parallelism: 20,
  testDelay: 200,
  rerunFailedTests: 0,
  plannerAlgorithm: 'forwardStateSpaceSearchHeuristic',
};
