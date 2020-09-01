'use strict';

const CustomError = require('../custom-error.js');

module.exports = function COMPONENT_ERROR(code, message) {
  return new CustomError('ComponentError', code, message);
};
