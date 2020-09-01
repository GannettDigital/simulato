'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/model/model-object-value.js', function() {
  let ModelError;
  let modelObjectValue;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/model/model-object-value.js');

    ModelError = sinon.stub();

    mockery.registerMock('./model-error.js', ModelError);

    modelObjectValue = require('../../../../../lib/errors/model/model-object-value.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ModelError with \'MODEL_OBJECT_VALUE\', and passed in message', function() {
      modelObjectValue('ERROR_MESSAGE');

      expect(ModelError.args).to.deep.equal([
        ['MODEL_OBJECT_VALUE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ModelError', function() {
      const result = modelObjectValue('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ModelError);
    });
  });
});
