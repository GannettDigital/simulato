'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/cli-event-dispatch/cli-event-dispatch.js', function() {
  let EventEmitter;
  let result;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/cli/cli-event-dispatch/cli-event-dispatch.js');

    EventEmitter = sinon.stub();

    mockery.registerMock('events', {EventEmitter});
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the file is required', function() {
    it('should call EventEmitter once', function() {
      require('../../../../../lib/cli/cli-event-dispatch/cli-event-dispatch.js');

      expect(EventEmitter.callCount).to.equal(1);
    });

    it('should call EventEmitter with the keyword \'new\'', function() {
      require('../../../../../lib/cli/cli-event-dispatch/cli-event-dispatch.js');

      expect(EventEmitter.calledWithNew()).to.equal(true);
    });

    it('should export result of the call the EventEmitter', function() {
      EventEmitter.returns({events: ['eventOne', 'eventTwo']});

      result = require('../../../../../lib/cli/cli-event-dispatch/cli-event-dispatch.js');

      expect(result).to.deep.equal({events: ['eventOne', 'eventTwo']});
    });
  });
});
