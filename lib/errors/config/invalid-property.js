'use strict';

let ConfigError = require('./config-error.js');

module.exports = function(message) {
  return new ConfigError('INVALID_PROPERTY', message);
};
