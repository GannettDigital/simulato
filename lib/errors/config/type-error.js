'use strict';

const ConfigError = require('./config-error.js');

module.exports = function(message) {
  return new ConfigError('TYPE_ERROR', message);
};
