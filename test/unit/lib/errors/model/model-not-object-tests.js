'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/model/model-not-object.js', function() {
  let ModelError;
  let modelNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/model/model-not-object.js');

    ModelError = sinon.stub();

    mockery.registerMock('./model-error.js', ModelError);

    modelNotObject = require('../../../../../lib/errors/model/model-not-object.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ModelError with \'MODEL_NOT_OBJECT\', and passed in message', function() {
      modelNotObject('ERROR_MESSAGE');

      expect(ModelError.args).to.deep.equal([
        ['MODEL_NOT_OBJECT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ModelError', function() {
      const result = modelNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ModelError);
    });
  });
});
