'use strict';

let CustomError = require('../custom-error.js');

module.exports = function INVALID_GENERATION_TECHNIQUE(code, message) {
  return new CustomError('INVALID_GENERATION_TECHNIQUE', code, message);
};
