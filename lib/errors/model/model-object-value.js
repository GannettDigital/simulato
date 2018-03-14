'use strict';

let ModelError = require('./model-error.js');

module.exports = function(message) {
  return new ModelError('MODEL_OBJECT_VALUE', message);
};
