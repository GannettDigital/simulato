'use strict';

const CustomError = require('../custom-error.js');

module.exports = function MODEL_ERROR(code, message) {
  return new CustomError('ModelError', code, message);
};
