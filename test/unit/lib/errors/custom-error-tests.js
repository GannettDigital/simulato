'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/custom-error.js', function() {
  let CustomError;

  describe('on file being require', function() {
    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/errors/custom-error.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the prototype of CustomError to Error.prototype', function() {
      CustomError = require('../../../../lib/errors/custom-error.js');

      expect(CustomError.prototype).to.deep.equal(Error.prototype);
    });

    it('should set the constructor of CustomError to non default Error.constructor descriptors', function() {
      CustomError = require('../../../../lib/errors/custom-error.js');

      expect(Object.getOwnPropertyDescriptor(CustomError.prototype, 'constructor')).to.deep.equal({
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('when the required file is executed', function() {
    let CustomError;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/errors/custom-error.js');

      sinon.spy(Error, 'captureStackTrace');

      CustomError = require('../../../../lib/errors/custom-error.js');
    });

    afterEach(function() {
      Error.captureStackTrace.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the prototype of the returned value to CustomErrors prototype', function() {
      const result = new CustomError('ERROR_NAME', 'ERROR_CODE', 'ERROR_MESSAGE');

      expect(Object.getPrototypeOf(result)).to.deep.equal(CustomError.prototype);
    });

    it('should set the returned value name value to the passed in name and code', function() {
      const result = new CustomError('ERROR_NAME', 'ERROR_CODE', 'ERROR_MESSAGE');

      expect(result.name).to.equal('ERROR_NAME ERROR_CODE');
    });

    it('should set the returned value code value to the passed in name and code', function() {
      const result = new CustomError('ERROR_NAME', 'ERROR_CODE', 'ERROR_MESSAGE');

      expect(result.code).to.equal('ERROR_CODE');
    });

    it('should set the returned value message value to the passed in name and code', function() {
      const result = new CustomError('ERROR_NAME', 'ERROR_CODE', 'ERROR_MESSAGE');

      expect(result.message).to.equal('ERROR_MESSAGE');
    });

    it('should call captureStackTrace once', function() {
      new CustomError('ERROR_NAME', 'ERROR_CODE', 'ERROR_MESSAGE');

      expect(Error.captureStackTrace.callCount).to.equal(1);
    });
  });
});
