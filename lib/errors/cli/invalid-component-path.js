'use strict';

let CLIError = require('./cli-error.js');

module.exports = function INVALID_COMPONENT_PATH(code, message) {
  return new CLIError('INVALID_COMPONENT_PATH', code, message);
};
