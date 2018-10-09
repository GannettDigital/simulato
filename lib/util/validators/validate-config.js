'use strict';

const Ajv = require('ajv');
const ajv = new Ajv();
const configSchema = require('../config/schema.js');

let validateConfig;

module.exports = validateConfig = {
  validate(config, configOptions, cliOptions, callback) {
    const valid = ajv.validate(configSchema, config);
    if (!valid) {
      let error = ajv.errors[0];
      if (error.keyword === 'required') {
        let key = '';
        if (error.dataPath) {
          key += `${error.dataPath.slice(1)}.`;
        }
        key += error.params.missingProperty;
        throw new SimulatoError.CONFIG.REQUIRED_PROPERTY(`Property '${key}' required`);
      } else if (error.keyword === 'type') {
        const key = error.dataPath.slice(1);
        const origin = validateConfig._getOrigin(key, configOptions, cliOptions);
        throw new SimulatoError.CONFIG.TYPE_ERROR(
            `Invalid Type: '${typeof config[key]}' for Property: '${key}' Origin: '${origin}'` +
            ` Valid Type: '${error.params.type}'`
        );
      } else if (error.keyword == 'enum') {
        const key = error.dataPath.slice(1);
        const origin = validateConfig._getOrigin(key, configOptions, cliOptions);
        throw new SimulatoError.CONFIG.INVALID_VALUE(
            `Invalid Value: '${config[key]}' for Property: '${key}' Origin: '${origin}'` +
            ` Valid Values: '${error.params.allowedValues}'`
        );
      } else {
        throw new SimulatoError.CONFIG.TYPE_ERROR(`Error validating schema. Message: '${error.message}'`);
      }
    }
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
};
