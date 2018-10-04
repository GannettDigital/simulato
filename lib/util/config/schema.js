'use strict';

// ajv schema

module.exports = {
  type: 'object',
  required: [
    'testPath', 'componentPath', 'outputPath', 'reporter',
    'plannerAlgorithm', 'parallelism', 'testDelay', 'rerunFailedTests',
  ],
  properties: {
    foo: {
      type: 'string',
    },
    testPath: {
      type: 'string',
    },
    componentPath: {
      type: 'string',
    },
    outputPath: {
      type: 'string',
    },
    reportPath: {
      type: 'string',
    },
    before: {
      type: 'string',
    },
    reporter: {
      type: 'string',
      enum: ['basic'],
    },
    reportFormat: {
      type: 'string',
      enum: ['JSON', 'actionJSON'],
    },
    technique: {
      type: 'string',
    },
    actionToCover: {
      type: 'string',
    },
    configFile: {
      type: 'string',
    },
    tunnelIdentifier: {
      type: 'string',
    },
    plannerAlgorithm: {
      type: 'string',
    },
    parallelism: {
      type: 'integer',
    },
    testDelay: {
      type: 'integer',
    },
    rerunFailedTests: {
      type: 'integer',
    },
    debugPort: {
      type: 'integer',
    },
    driver: {
      type: 'object',
    },
    debug: {
      type: 'boolean',
    },
  },
};
