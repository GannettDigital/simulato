'use strict';

const ElementError = require('./element-error.js');

module.exports = function(message) {
  return new ElementError('ELEMENT_NOT_OBJECT', message);
};
