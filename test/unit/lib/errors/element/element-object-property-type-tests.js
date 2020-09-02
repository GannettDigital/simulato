'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/element/element-object-property-type.js', function() {
  let ElementError;
  let elementObjectPropertyType;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/element/element-object-property-type.js');

    ElementError = sinon.stub();

    mockery.registerMock('./element-error.js', ElementError);

    elementObjectPropertyType = require('../../../../../lib/errors/element/element-object-property-type.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ElementError with \'ELEMENT_OBJECT_PROPERTY_TYPE\', and passed in message', function() {
      elementObjectPropertyType('ERROR_MESSAGE');

      expect(ElementError.args).to.deep.equal([
        ['ELEMENT_OBJECT_PROPERTY_TYPE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ElementError', function() {
      const result = elementObjectPropertyType('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ElementError);
    });
  });
});
