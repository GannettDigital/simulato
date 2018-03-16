'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/runner-event-dispatch/runner-event-dispatch.js', function() {
  describe('on file being required', function() {
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/runner-event-dispatch/runner-event-dispatch.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call EventEmitter once', function() {
      require('../../../../../lib/runner/runner-event-dispatch/runner-event-dispatch.js');

      expect(EventEmitter.callCount).to.equal(1);
    });

    it('should call EventEmitter with the keyword \'new\'', function() {
      require('../../../../../lib/runner/runner-event-dispatch/runner-event-dispatch.js');

      expect(EventEmitter.calledWithNew()).to.equal(true);
    });

    it('should export result of the call the EventEmitter', function() {
      EventEmitter.returns({events: ['eventOne', 'eventTwo']});

      let result = require('../../../../../lib/runner/runner-event-dispatch/runner-event-dispatch.js');

      expect(result).to.deep.equal({events: ['eventOne', 'eventTwo']});
    });
  });
});
