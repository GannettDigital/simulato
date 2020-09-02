'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/component-error.js', function() {
  let CustomError;
  let componentError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/component-error.js');

    CustomError = sinon.stub();

    mockery.registerMock('../custom-error.js', CustomError);

    componentError = require('../../../../../lib/errors/component/component-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new CustomError with \'ComponentError\', and passed in code and message', function() {
      componentError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(CustomError.args).to.deep.equal([
        ['ComponentError', 'ERROR_CODE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new CustomError', function() {
      const result = componentError('ERROR_CODE', 'ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(CustomError);
    });
  });
});
