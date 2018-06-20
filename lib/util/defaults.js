'use strict';

module.exports = {
  componentPath: `${process.cwd()}/components`,
  outputPath: process.cwd(),
  testPath: `${process.cwd()}/tests`,
  configFile: `${process.cwd()}/simulato-config.js`,
  technique: 'actionFocused',
  reporter: 'basic',
  parallelism: 20,
  testDelay: 200,
  rerunFailedTests: 0,
};
