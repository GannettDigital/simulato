'use strict';

const ConfigError = require('./config-error.js');

module.exports = function(message) {
  return new ConfigError('INVALID_VALUE', message);
};
