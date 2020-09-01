'use strict';

const CustomError = require('../custom-error.js');

module.exports = function CLI_ERROR(code, message) {
  return new CustomError('CLIError', code, message);
};
