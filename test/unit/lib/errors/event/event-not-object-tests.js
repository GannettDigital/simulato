'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/event/event-not-object.js', function() {
  let EventError;
  let eventNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/event/event-not-object.js');

    EventError = sinon.stub();

    mockery.registerMock('./event-error.js', EventError);

    eventNotObject = require('../../../../../lib/errors/event/event-not-object.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new EventError with \'EVENT_NOT_OBJECT\', and passed in message', function() {
      eventNotObject('ERROR_MESSAGE');

      expect(EventError.args).to.deep.equal([
        ['EVENT_NOT_OBJECT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new EventError', function() {
      const result = eventNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(EventError);
    });
  });
});
