'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;

describe('lib/util/config/schema.js', function() {
  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/util/config/schema.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export the schema object', function() {
    const schema = require('../../../../../lib/util/config/schema.js');

    expect(schema).to.deep.equal({
      type: 'object',
      required: [
        'testPath', 'componentPath', 'outputPath', 'reporter',
        'plannerAlgorithm', 'parallelism', 'testDelay', 'rerunFailedTests',
      ],
      properties: {
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
        reportStates: {
          type: 'boolean',
        },
        reportPreconditions: {
          type: 'boolean',
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
          enum: ['JSON', 'actionJSON', 'JUnit'],
        },
        jUnitReportSpecificity: {
          type: 'string',
          enum: ['testReport', 'testRun', 'action'],
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
        plannerTestLength: {
          type: 'integer',
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
    });
  });
});
