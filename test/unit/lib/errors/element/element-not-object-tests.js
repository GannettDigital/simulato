'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/element/element-not-object.js', function() {
  let ElementError;
  let elementNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/element/element-not-object.js');

    ElementError = sinon.stub();

    mockery.registerMock('./element-error.js', ElementError);

    elementNotObject = require('../../../../../lib/errors/element/element-not-object.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ElementError with \'ELEMENT_NOT_OBJECT\', and passed in message', function() {
      elementNotObject('ERROR_MESSAGE');

      expect(ElementError.args).to.deep.equal([
        ['ELEMENT_NOT_OBJECT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ElementError', function() {
      const result = elementNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ElementError);
    });
  });
});
