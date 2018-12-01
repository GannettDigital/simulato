'use strict';

let GOAL_NOT_FOUND = require('./goal-not-found.js');
let FAILED_TO_BACKTRACK = require('./failed-to-backtrack.js');
let DUPLICATE_PLAN_GENERATED = require('./duplicate-plan-generated.js');
let NO_STARTING_ACTIONS = require('./no-starting-actions.js');

module.exports = {
  GOAL_NOT_FOUND,
  FAILED_TO_BACKTRACK,
  DUPLICATE_PLAN_GENERATED,
  NO_STARTING_ACTIONS,
};
