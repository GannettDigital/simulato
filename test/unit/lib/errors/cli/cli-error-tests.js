'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/cli-error.js', function() {
  let CustomError;
  let cliError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli/cli-error.js');

    CustomError = sinon.stub();

    mockery.registerMock('../custom-error.js', CustomError);

    cliError = require('../../../../../lib/errors/cli/cli-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CustomError with \'CLIError\', and passed in code and message', function() {
      cliError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CustomError.args).to.deep.equal([
        ['CLIError', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CustomError', function() {
      const result = cliError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CustomError);
    });
  });
});
