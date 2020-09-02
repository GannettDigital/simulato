'use strict';

const _ = require('lodash');
const path = require('path');
const defaults = require('./defaults.js');
const uuidv4 = require('uuid').v4;
const Emitter = require('../emitter.js');
const globalEventDispatch = require('../../global-event-dispatch/global-event-dispatch.js');

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
      _.merge(configHandler._config, configHandler._structureCliOptions(cliOptions.opts()));

      if (configHandler.get('driver.saucelabs')) {
        _.set(configHandler._config, 'driver.capabilities.tunnel-identifier', `MBTT${uuidv4()}`);
      }
      configHandler._resolvePaths(configHandler._config);
      Object.freeze(configHandler._config);
      configHandler.emit('configHandler.readyToValidate', configHandler._config, configFile, cliOptions, function() {
        return configHandler.emit('configHandler.configCreated', cliOptions.name());
      });
    });
  },
  get(propertyPath) {
    return _.get(configHandler._config, propertyPath);
  },
  getAll() {
    return configHandler._config;
  },
  _structureCliOptions(cliOptions) {
    if (cliOptions.saucelabs) {
      delete cliOptions.saucelabs;
      _.set(cliOptions, 'driver.saucelabs', true);
    }
    return cliOptions;
  },
  _getBaseConfig(cliOptions, callback) {
    let configFile;
    if (cliOptions.configFile) {
      configFile = require(path.normalize(`${process.cwd()}/${cliOptions.configFile}`));
    } else {
      try {
        configFile = require(path.normalize(defaults.configFile));
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          configFile = {};
        } else {
          throw error;
        }
      }
    }
    if (!(typeof configFile === 'object') || Array.isArray(configFile)) {
      let errorMessage = 'The config provided at path: ';
      if (cliOptions.configFile) {
        errorMessage += cliOptions.configFile;
      } else {
        errorMessage += defaults.configFile;
      }
      errorMessage += ' was not returned as an object';
      throw new SimulatoError.CONFIG.TYPE_ERROR(errorMessage);
    }
    return callback(configFile);
  },
  _resolvePaths() {
    configHandler._config.componentPath = path.resolve(configHandler._config.componentPath);
    configHandler._config.outputPath = path.resolve(configHandler._config.outputPath);
    configHandler._config.testPath = path.resolve(configHandler._config.testPath);
    if (configHandler._config.reportPath) {
      configHandler._config.reportPath = path.resolve(configHandler._config.reportPath);
    }
    if (configHandler._config.before) {
      configHandler._config.before = path.resolve(configHandler._config.before);
    }
  },
};

Emitter.mixIn(configHandler, globalEventDispatch);
