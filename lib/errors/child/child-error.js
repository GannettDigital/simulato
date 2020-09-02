'use strict';

const CustomError = require('../custom-error.js');

module.exports = function CHILD_ERROR(code, message) {
  return new CustomError('ChildError', code, message);
};
