'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/child/child-error.js', function() {
  let CustomError;
  let childError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/child/child-error.js');

    CustomError = sinon.stub();

    mockery.registerMock('../custom-error.js', CustomError);

    childError = require('../../../../../lib/errors/child/child-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CustomError with \'ChildError\', and passed in code and message', function() {
      childError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CustomError.args).to.deep.equal([
        ['ChildError', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CustomError', function() {
      let result;

      result = childError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CustomError);
    });
  });
});
