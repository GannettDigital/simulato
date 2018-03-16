'use strict';

let CustomError = require('../custom-error.js');

module.exports = function INVALID_COMPONENT_PATH(code, message) {
  return new CustomError('INVALID_COMPONENT_PATH', code, message);
};
