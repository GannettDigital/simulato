'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/element/elements-not-array.js', function() {
  let ElementError;
  let elementsNotArray;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/element/elements-not-array.js');

    ElementError = sinon.stub();

    mockery.registerMock('./element-error.js', ElementError);

    elementsNotArray = require('../../../../../lib/errors/element/elements-not-array.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ElementError with \'ELEMENTS_NOT_ARRAY\', and passed in message', function() {
      elementsNotArray('ERROR_MESSAGE');

      expect(ElementError.args).to.deep.equal([
        ['ELEMENTS_NOT_ARRAY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ElementError', function() {
      const result = elementsNotArray('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ElementError);
    });
  });
});
