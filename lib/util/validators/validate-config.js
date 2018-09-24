'use strict';

let validateConfig;

module.exports = validateConfig = {
  _stringValues: [
    'testPath', 'componentPath', 'reportPath',
    'outputPath', 'before', 'reporter',
    'technique', 'actionToCover', 'configFile',
    'reportFormat', 'tunnelIdentifier', 'plannerAlgorithm',
  ],
  _numberValues: [
    'parallelism', 'testDelay',
    'rerunFailedTests', 'debugPort',
  ],
  _objectValues: ['sauceCapabilities'],
  _booleanValues: ['debug', 'saucelabs'],
  validate(config, configOptions, cliOptions, callback) {
    for (let key in config) {
      if (config.hasOwnProperty(key) && config[key]) {
        let origin = validateConfig._getOrigin(key, configOptions, cliOptions);
        let value = config[key];
        validateConfig._validateType(origin, key, value);
      }
    }
    validateConfig._validateReporter(config, configOptions, cliOptions);
    validateConfig._validateWriter(config, configOptions, cliOptions);
    return callback();
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
  _validateReporter(config, configOptions, cliOptions) {
    let validReporters = ['basic'];
    if (!validReporters.includes(config.reporter)) {
      let origin = validateConfig._getOrigin('reporter', configOptions, cliOptions);
      throw new SimulatoError.CONFIG.INVALID_VALUE(
          `${origin} property 'reporter' has unknown value '${config.reporter}'`
      );
    }
  },
  _validateWriter(config, configOptions, cliOptions) {
    let validFormats = ['JSON'];
    if (!validFormats.includes(config.reportFormat)) {
      let origin = validateConfig._getOrigin('reportFormat', configOptions, cliOptions);
      throw new SimulatoError.CONFIG.INVALID_VALUE(
          `${origin} property 'reportFormat' has unknown value '${config.reportFormat}'`
      );
    }
  },
};
