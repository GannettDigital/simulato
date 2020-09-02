'use strict';

const ElementError = require('./element-error.js');

module.exports = function(message) {
  return new ElementError('ELEMENTS_NOT_ARRAY', message);
};
