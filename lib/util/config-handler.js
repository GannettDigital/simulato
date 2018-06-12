'use strict';

const _ = require('lodash');
const path = require('path');
const defaults = require('./defaults.js');

let configHandler;

module.exports = configHandler = {
  createConfig(cliOptions, callback) {
    let config = {};
    if (process.env.USING_PARENT_TEST_RUNNER) {
      config = JSON.parse(process.env.PARENT_CONFIG);
      config.testPath = process.env.TEST_PATH;
      Object.freeze(config);
      return callback(config);
    }
    _.merge(config, defaults);
    configHandler._getBaseConfig(cliOptions, function(configFile) {
      _.merge(config, configFile);
      _.merge(config, cliOptions);
      configHandler._resolvePaths(config);
      process.env.PARENT_CONFIG = JSON.stringify(config);
      Object.freeze(config);
      return callback(config);
    });
  },
  _getBaseConfig(cliOptions, callback) {
    let config;
    if (cliOptions.configFile) {
      config = require(path.normalize(`${process.cwd()}/${cliOptions.configFile}`));
    } else {
      try {
        config = require(path.normalize(`${process.cwd()}/config.js`));
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          config = {};
        } else {
          throw error;
        }
      }
    }
    return callback(config);
  },
  _resolvePaths(config) {
    config.componentPath = path.resolve(config.componentPath);
    config.outputPath = path.resolve(config.outputPath);
    config.reportPath = path.resolve(config.reportPath);
    config.testPath = path.resolve(config.testPath);
    if (config.before) {
      config.before = path.resolve(config.before);
    }
  },
};
