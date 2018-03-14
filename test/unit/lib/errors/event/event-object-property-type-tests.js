'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/event/event-object-property-type.js', function() {
  let EventError;
  let eventObjectPropertyType;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/event/event-object-property-type.js');

    EventError = sinon.stub();

    mockery.registerMock('./event-error.js', EventError);

    eventObjectPropertyType = require('../../../../../lib/errors/event/event-object-property-type.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new EventError with \'EVENT_OBJECT_PROPERTY_TYPE\', and passed in message', function() {
      eventObjectPropertyType('ERROR_MESSAGE');

      expect(EventError.args).to.deep.equal([
        ['EVENT_OBJECT_PROPERTY_TYPE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new EventError', function() {
      let result;

      result = eventObjectPropertyType('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(EventError);
    });
  });
});
