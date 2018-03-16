'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/child/index.js', function() {
  let CHILDREN_NOT_ARRAY;
  let CHILD_NOT_OBJECT;
  let CHILD_OBJECT_PROPERTY_TYPE;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/child');

    CHILDREN_NOT_ARRAY = sinon.stub();
    CHILD_NOT_OBJECT = sinon.stub();
    CHILD_OBJECT_PROPERTY_TYPE = sinon.stub();

    mockery.registerMock('./children-not-array.js', CHILDREN_NOT_ARRAY);
    mockery.registerMock('./child-not-object.js', CHILD_NOT_OBJECT);
    mockery.registerMock('./child-object-property-type.js', CHILD_OBJECT_PROPERTY_TYPE);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 3 items on an object', function() {
    let result = require('../../../../../lib/errors/child');

    expect(Object.getOwnPropertyNames(result).length).to.equal(3);
  });

  it('should have the property \'CHILDREN_NOT_ARRAY\' with the value from requiring'
    + ' \'./children-not-array.js\'', function() {
    let result = require('../../../../../lib/errors/child');

    expect(result.CHILDREN_NOT_ARRAY).to.deep.equal(CHILDREN_NOT_ARRAY);
  });

  it('should have the property \'CHILD_NOT_OBJECT\' with the value from requiring'
    + ' \'./model-object-value.js\'', function() {
    let result = require('../../../../../lib/errors/child');

    expect(result.CHILD_NOT_OBJECT).to.deep.equal(CHILD_NOT_OBJECT);
  });

  it('should have the property \'CHILD_OBJECT_PROPERTY_TYPE\' with the value from requiring'
    + ' \'./child-object-property-type.js\'', function() {
    let result = require('../../../../../lib/errors/child');

    expect(result.CHILD_OBJECT_PROPERTY_TYPE).to.deep.equal(CHILD_OBJECT_PROPERTY_TYPE);
  });
});
