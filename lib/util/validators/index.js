'use strict';

const validateElements = require('./validate-elements.js');
const validateModel = require('./validate-model.js');
const validateComponents = require('./validate-components.js');
const validateTestCases = require('./validate-test-cases.js');
const validateEvents = require('./validate-events.js');
const validateChildren = require('./validate-children.js');
const validateActions = require('./validate-actions.js');


module.exports = {
  validateElements,
  validateModel: validateModel.validate,
  validateComponents,
  validateTestCases,
  validateEvents,
  validateChildren,
  validateActions: validateActions.validate,
};
