'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/event/index.js', function() {
  let EVENTS_NOT_ARRAY;
  let EVENT_NOT_OBJECT;
  let EVENT_OBJECT_PROPERTY_TYPE;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/event');

    EVENTS_NOT_ARRAY = sinon.stub();
    EVENT_NOT_OBJECT = sinon.stub();
    EVENT_OBJECT_PROPERTY_TYPE = sinon.stub();

    mockery.registerMock('./events-not-array.js', EVENTS_NOT_ARRAY);
    mockery.registerMock('./event-not-object.js', EVENT_NOT_OBJECT);
    mockery.registerMock('./event-object-property-type.js', EVENT_OBJECT_PROPERTY_TYPE);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 3 items on an object', function() {
    const result = require('../../../../../lib/errors/event');

    expect(Object.getOwnPropertyNames(result).length).to.equal(3);
  });

  it('should have the property \'EVENTS_NOT_ARRAY\' with the value from requiring' +
    ' \'./events-not-array.js\'', function() {
    const result = require('../../../../../lib/errors/event');

    expect(result.EVENTS_NOT_ARRAY).to.deep.equal(EVENTS_NOT_ARRAY);
  });

  it('should have the property \'EVENT_NOT_OBJECT\' with the value from requiring' +
    ' \'./model-object-value.js\'', function() {
    const result = require('../../../../../lib/errors/event');

    expect(result.EVENT_NOT_OBJECT).to.deep.equal(EVENT_NOT_OBJECT);
  });

  it('should have the property \'EVENT_OBJECT_PROPERTY_TYPE\' with the value from requiring' +
    ' \'./event-object-property-type.js\'', function() {
    const result = require('../../../../../lib/errors/event');

    expect(result.EVENT_OBJECT_PROPERTY_TYPE).to.deep.equal(EVENT_OBJECT_PROPERTY_TYPE);
  });
});
