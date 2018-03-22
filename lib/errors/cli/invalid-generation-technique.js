'use strict';

let CLIError = require('./cli-error.js');

module.exports = function INVALID_GENERATION_TECHNIQUE(code, message) {
  return new CLIError('INVALID_GENERATION_TECHNIQUE', code, message);
};
