'use strict';

const ConfigError = require('./config-error.js');

module.exports = function(message) {
  return new ConfigError('REQUIRED_PROPERTY', message);
};
