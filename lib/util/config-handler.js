'use strict';

const _ = require('lodash');
const path = require('path');
const defaults = require('./defaults.js');
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events').EventEmitter;

let configHandler;

module.exports = configHandler = {
  _config: {},
  createConfig(cliOptions) {
    if (process.env.USING_PARENT_TEST_RUNNER) {
      configHandler._config = JSON.parse(process.env.PARENT_CONFIG);
      configHandler._config.testPath = process.env.TEST_PATH;
      configHandler._config.testName = process.env.TEST_PATH.split('\\').pop().split('/').pop();
      Object.freeze(configHandler._config);
      return configHandler.emit('configHandler.configCreated', cliOptions.name());
    }
    _.merge(configHandler._config, defaults);
    configHandler._getBaseConfig(cliOptions.opts(), function(configFile) {
      _.merge(configHandler._config, configFile);
      _.merge(configHandler._config, cliOptions.opts());
      if (configHandler.get('saucelabs')) {
        configHandler._config.tunnelIdentifier = `MBTT${uuidv4()}`;
      }
      configHandler._resolvePaths(configHandler._config);
      Object.freeze(configHandler._config);
      return configHandler.emit('configHandler.configCreated', cliOptions.name());
    });
  },
  get(propertyPath) {
    return _.get(configHandler._config, propertyPath);
  },
  getAll() {
    return configHandler._config;
  },
  _getBaseConfig(cliOptions, callback) {
    let configFile;
    if (cliOptions.configFile) {
      configFile = require(path.normalize(`${process.cwd()}/${cliOptions.configFile}`));
    } else {
      try {
        configFile = require(path.normalize(`${process.cwd()}/config.js`));
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          configFile = {};
        } else {
          throw error;
        }
      }
    }
    return callback(configFile);
  },
  _resolvePaths() {
    configHandler._config.componentPath = path.resolve(configHandler._config.componentPath);
    configHandler._config.outputPath = path.resolve(configHandler._config.outputPath);
    configHandler._config.reportPath = path.resolve(configHandler._config.reportPath);
    configHandler._config.testPath = path.resolve(configHandler._config.testPath);
    if (configHandler._config.before) {
      configHandler._config.before = path.resolve(configHandler._config.before);
    }
  },
};

Object.setPrototypeOf(configHandler, new EventEmitter());
