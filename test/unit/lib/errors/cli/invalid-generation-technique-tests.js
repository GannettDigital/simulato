'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/invalid-generation-technique.js', function() {
  let CLIError;
  let invalidGenerationTechnique;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli/invalid-generation-technique.js');

    CLIError = sinon.stub();

    mockery.registerMock('./cli-error.js', CLIError);

    invalidGenerationTechnique = require('../../../../../lib/errors/cli/invalid-generation-technique.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CLIError with \'INVALID_GENERATION_TECHNIQUE\', and passed in code and message', function() {
      invalidGenerationTechnique('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CLIError.args).to.deep.equal([
        ['INVALID_GENERATION_TECHNIQUE', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CLIError', function() {
      let result;

      result = invalidGenerationTechnique('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CLIError);
    });
  });
});
