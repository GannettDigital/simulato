'use strict';

let validateConfig;

module.exports = function(config, configOptions, cliOptions, callback) {
  let stringValues = [
    'testPath', 'componentPath', 'reportPath',
    'outputPath', 'before', 'reporter',
    'technique', 'actionToCover',
  ];

  let numberValues = [
    'parallelism', 'testDelay',
    'rerunFailedTests', 'debugPort',
  ];

  let objectValues = ['sauceCapabilities'];

  let booleanValues = [
    'debug', 'saucelabs',
  ];

  let pathValues = [
    'testPath', 'componentPath', 'reportPath',
    'outputPath', 'before',
  ];

  for (let key in validateConfig._config) {
    if (validateConfig._config.hasOwnProperty(key)) {
      let origin;
      if (validateConfig._cliOptions.hasOwnProperty(key)) {
        origin = 'cli';
      } else if (validateConfig._configOptions.hasOwnProperty(key)) {
        origin = 'config';
      } else {
        origin = 'default';
      }
      let value = validateConfig._config[key];

      if (stringValues.includes(key)) {
        if (typeof value !== 'string') {
          throw new SimulatoError.CONFIG.CONFIG_TYPE_ERROR(`${origin} property '${key}' must be a string`);
        }
      } else if (numberValues.includes(key)) {
        if (typeof value !== 'number') {
          throw new SimulatoError.CONFIG.CONFIG_TYPE_ERROR(`${origin} property '${key}' must be a number`);
        }
      } else if (booleanValues.includes(key)) {
        if (typeof value !== 'boolean') {
          throw new SimulatoError.CONFIG.CONFIG_TYPE_ERROR(`${origin} property '${key}' must be a boolean`);
        }
      } else if (objectValues.includes(key)) {
        if (!(typeof config === 'object') || Array.isArray(config)) {
          throw new SimulatoError.CONFIG.CONFIG_TYPE_ERROR(`${origin} property '${key}' must be an object`);
        }
      } else {
        throw new SimulatoError.CONFIG.INVALID_PROPERY(`${origin} property '${key}' is unknown property`);
      }

      if (pathValues.includes(key)) {
        try {
          require(value);
        } catch (error) {
          throw new SimulatoError.CONFIG.INVALID_PATH(
            `${origin} property '${key}' could not be loaded for reason '${error.message}'`
          );
        }
      }
    }
  }
};
