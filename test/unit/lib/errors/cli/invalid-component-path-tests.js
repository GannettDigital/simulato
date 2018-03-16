'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/invalid-component-path.js', function() {
  let CustomError;
  let invalidComponentPath;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli/invalid-component-path.js');

    CustomError = sinon.stub();

    mockery.registerMock('../custom-error.js', CustomError);

    invalidComponentPath = require('../../../../../lib/errors/cli/invalid-component-path.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CustomError with \'INVALID_COMPONENT_PATH\', and passed in code and message', function() {
      invalidComponentPath('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CustomError.args).to.deep.equal([
        ['INVALID_COMPONENT_PATH', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CustomError', function() {
      let result;

      result = invalidComponentPath('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CustomError);
    });
  });
});
