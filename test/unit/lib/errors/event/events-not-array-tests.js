'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/event/events-not-array.js', function() {
  let EventError;
  let eventsNotArray;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/event/events-not-array.js');

    EventError = sinon.stub();

    mockery.registerMock('./event-error.js', EventError);

    eventsNotArray = require('../../../../../lib/errors/event/events-not-array.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new EventError with \'EVENTS_NOT_ARRAY\', and passed in message', function() {
      eventsNotArray('ERROR_MESSAGE');

      expect(EventError.args).to.deep.equal([
        ['EVENTS_NOT_ARRAY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new EventError', function() {
      let result;

      result = eventsNotArray('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(EventError);
    });
  });
});
