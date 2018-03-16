'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/model/index.js', function() {
  let MODEL_NOT_OBJECT;
  let MODEL_OBJECT_VALUE;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/model');

    MODEL_NOT_OBJECT = sinon.stub();
    MODEL_OBJECT_VALUE = sinon.stub();

    mockery.registerMock('./model-not-object.js', MODEL_NOT_OBJECT);
    mockery.registerMock('./model-object-value.js', MODEL_OBJECT_VALUE);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 2 items on an object', function() {
    let result = require('../../../../../lib/errors/model');

    expect(Object.getOwnPropertyNames(result).length).to.equal(2);
  });

  it('should have the property \'MODEL_NOT_OBJECT\' with the value from requiring'
    + ' \'./model-not-object.js\'', function() {
    let result = require('../../../../../lib/errors/model');

    expect(result.MODEL_NOT_OBJECT).to.deep.equal(MODEL_NOT_OBJECT);
  });

  it('should have the property \'MODEL_OBJECT_VALUE\' with the value from requiring'
    + ' \'./model-object-value.js\'', function() {
    let result = require('../../../../../lib/errors/model');

    expect(result.MODEL_OBJECT_VALUE).to.deep.equal(MODEL_OBJECT_VALUE);
  });
});
