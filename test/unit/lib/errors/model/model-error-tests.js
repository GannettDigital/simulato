'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/model/model-error.js', function() {
  let CustomError;
  let modelError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/model/model-error.js');

    CustomError = sinon.stub();

    mockery.registerMock('../custom-error.js', CustomError);

    modelError = require('../../../../../lib/errors/model/model-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CustomError with \'ModelError\', and passed in code and message', function() {
      modelError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CustomError.args).to.deep.equal([
        ['ModelError', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CustomError', function() {
      const result = modelError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CustomError);
    });
  });
});
