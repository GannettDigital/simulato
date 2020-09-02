'use strict';

const CustomError = require('../custom-error.js');

module.exports = function ELEMENT_ERROR(code, message) {
  return new CustomError('ElementError', code, message);
};
