'use strict';

let CustomError = require('../custom-error.js');

module.exports = function ACTION_ERROR(code, message) {
  return new CustomError('ActionError', code, message);
};
