'use strict';

const ChildError = require('./child-error.js');

module.exports = function(message) {
  return new ChildError('CHILDREN_NOT_ARRAY', message);
};
