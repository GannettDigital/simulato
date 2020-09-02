'use strict';

const CustomError = require('../custom-error.js');

module.exports = function CONFIG_ERROR(code, message) {
  return new CustomError('ConfigError', code, message);
};
