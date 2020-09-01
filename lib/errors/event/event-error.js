'use strict';

const CustomError = require('../custom-error.js');

module.exports = function EVENT_ERROR(code, message) {
  return new CustomError('EventError', code, message);
};
