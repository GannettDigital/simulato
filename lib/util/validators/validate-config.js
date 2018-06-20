'use strict';

let validateConfig;

module.exports = validateConfig = {
  _stringValues: [
    'testPath', 'componentPath', 'reportPath',
    'outputPath', 'before', 'reporter',
    'technique', 'actionToCover', 'configFile',
  ],
  _numberValues: [
    'parallelism', 'testDelay',
    'rerunFailedTests', 'debugPort',
  ],
  _objectValues: ['sauceCapabilities'],
  _booleanValues: ['debug', 'saucelabs'],
  validate(config, configOptions, cliOptions, callback) {
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        let origin = validateConfig._getOrigin(key, configOptions, cliOptions);
        let value = config[key];
        validateConfig._validateType(origin, key, value);
        return callback();
      }
    }
  },
  _getOrigin(key, configOptions, cliOptions) {
    if (cliOptions.hasOwnProperty(key)) {
      return 'cli';
    } else if (configOptions.hasOwnProperty(key)) {
      return 'config';
    } else {
      return 'default';
    }
  },
  _validateType(origin, key, value) {
    if (validateConfig._stringValues.includes(key)) {
      if (typeof value !== 'string') {
        throw new SimulatoError.CONFIG.TYPE_ERROR(`${origin} property '${key}' must be a string`);
      }
    } else if (validateConfig._numberValues.includes(key)) {
      if (typeof value !== 'number') {
        throw new SimulatoError.CONFIG.TYPE_ERROR(`${origin} property '${key}' must be a number`);
      }
    } else if (validateConfig._booleanValues.includes(key)) {
      if (typeof value !== 'boolean') {
        throw new SimulatoError.CONFIG.TYPE_ERROR(`${origin} property '${key}' must be a boolean`);
      }
    } else if (validateConfig._objectValues.includes(key)) {
      if (!(typeof value === 'object') || Array.isArray(value)) {
        throw new SimulatoError.CONFIG.TYPE_ERROR(`${origin} property '${key}' must be an object`);
      }
    } else {
      throw new SimulatoError.CONFIG.INVALID_PROPERTY(`${origin} property '${key}' is unknown property`);
    }
  },
};
