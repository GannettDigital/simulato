'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/config/index.js', function() {
    let TYPE_ERROR;
    let INVALID_PROPERTY;
    let INVALID_VALUE;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/errors/config');

        TYPE_ERROR = sinon.stub();
        INVALID_PROPERTY = sinon.stub();
        INVALID_VALUE = sinon.stub();

        mockery.registerMock('./type-error.js', TYPE_ERROR);
        mockery.registerMock('./invalid-property.js', INVALID_PROPERTY);
        mockery.registerMock('./invalid-value.js', INVALID_VALUE);
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should export 3 items on an object', function() {
        let result = require('../../../../../lib/errors/config');

        expect(Object.getOwnPropertyNames(result).length).to.equal(3);
    });

    it('should have the property \'TYPE_ERROR\' with the value from requiring'
        + ' \'./type-error.js\'', function() {
        let result = require('../../../../../lib/errors/config');

        expect(result.TYPE_ERROR).to.deep.equal(TYPE_ERROR);
    });

    it('should have the property \'INVALID_PROPERTY\' with the value from requiring'
      + ' \'./invalid-property.js\'', function() {
      let result = require('../../../../../lib/errors/config');

      expect(result.INVALID_PROPERTY).to.deep.equal(INVALID_PROPERTY);
    });

    it('should have the property \'INVALID_VALUE\' with the value from requiring'
    + ' \'./invalid-property.js\'', function() {
    let result = require('../../../../../lib/errors/config');

    expect(result.INVALID_VALUE).to.deep.equal(INVALID_VALUE);
  });
});
