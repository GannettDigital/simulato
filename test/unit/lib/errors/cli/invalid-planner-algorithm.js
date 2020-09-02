'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/invalid-planner-algorithm.js', function() {
  let CLIError;
  let invalidComponentPath;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli/invalid-planner-algorithm.js');

    CLIError = sinon.stub();

    mockery.registerMock('./cli-error.js', CLIError);

    invalidComponentPath = require('../../../../../lib/errors/cli/invalid-planner-algorithm.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CLIError with \'INVALID_PLANNER_ALGORITHM\', and passed in code and message', function() {
      invalidComponentPath('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CLIError.args).to.deep.equal([
        ['INVALID_PLANNER_ALGORITHM', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CLIError', function() {
      const result = invalidComponentPath('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CLIError);
    });
  });
});
