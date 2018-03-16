'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/element/index.js', function() {
    let ELEMENT_NOT_FOUND;
    let ELEMENTS_NOT_ARRAY;
    let ELEMENT_NOT_OBJECT;
    let ELEMENT_OBJECT_PROPERTY_TYPE;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/errors/element');

        ELEMENT_NOT_FOUND = sinon.stub();
        ELEMENTS_NOT_ARRAY = sinon.stub();
        ELEMENT_NOT_OBJECT = sinon.stub();
        ELEMENT_OBJECT_PROPERTY_TYPE = sinon.stub();

        mockery.registerMock('./element-not-found.js', ELEMENT_NOT_FOUND);
        mockery.registerMock('./elements-not-array.js', ELEMENTS_NOT_ARRAY);
        mockery.registerMock('./element-not-object.js', ELEMENT_NOT_OBJECT);
        mockery.registerMock('./element-object-property-type.js', ELEMENT_OBJECT_PROPERTY_TYPE);
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should export 4 items on an object', function() {
        let result = require('../../../../../lib/errors/element');

        expect(Object.getOwnPropertyNames(result).length).to.equal(4);
    });

    it('should have the property \'ELEMENT_NOT_FOUND\' with the value from requiring'
        + ' \'./element-not-found.js\'', function() {
        let result = require('../../../../../lib/errors/element');

        expect(result.ELEMENT_NOT_FOUND).to.deep.equal(ELEMENT_NOT_FOUND);
    });

    it('should have the property \'ELEMENTS_NOT_ARRAY\' with the value from requiring'
      + ' \'./elements-not-array.js\'', function() {
      let result = require('../../../../../lib/errors/element');

      expect(result.ELEMENTS_NOT_ARRAY).to.deep.equal(ELEMENTS_NOT_ARRAY);
    });

    it('should have the property \'ELEMENT_NOT_OBJECT\' with the value from requiring'
      + ' \'./element-not-object.js\'', function() {
      let result = require('../../../../../lib/errors/element');

      expect(result.ELEMENT_NOT_OBJECT).to.deep.equal(ELEMENT_NOT_OBJECT);
    });

    it('should have the property \'ELEMENT_OBJECT_PROPERTY_TYPE\' with the value from requiring'
      + ' \'./element-object-property-type.js\'', function() {
      let result = require('../../../../../lib/errors/element');

      expect(result.ELEMENT_OBJECT_PROPERTY_TYPE).to.deep.equal(ELEMENT_OBJECT_PROPERTY_TYPE);
    });
});
