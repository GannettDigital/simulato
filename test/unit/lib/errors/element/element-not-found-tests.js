'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/element/element-not-found.js', function() {
  let ElementError;
  let elementNotFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/element/element-not-found.js');

    ElementError = sinon.stub();

    mockery.registerMock('./element-error.js', ElementError);

    elementNotFound = require('../../../../../lib/errors/element/element-not-found.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ElementError with \'ELEMENT_NOT_FOUND\', and passed in message', function() {
      elementNotFound('ERROR_MESSAGE');

      expect(ElementError.args).to.deep.equal([
        ['ELEMENT_NOT_FOUND', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ElementError', function() {
      let result;

      result = elementNotFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ElementError);
    });
  });
});
