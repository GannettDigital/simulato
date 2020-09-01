'use strict';

const RunnerError = require('./runner-error.js');

module.exports = function(message) {
  return new RunnerError('SPAWN_CHILD_ERROR', message);
};
