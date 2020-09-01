'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/runner-event-dispatch/initialize-runner-event-dispatch.js', function() {
  let runnerEventDispatch;
  let registerRunnerEvents;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/runner-event-dispatch/initialize-runner-event-dispatch.js');

    runnerEventDispatch = {};
    registerRunnerEvents = sinon.stub();

    mockery.registerMock('./runner-event-dispatch.js', runnerEventDispatch);
    mockery.registerMock('./register-runner-events.js', registerRunnerEvents);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the exported function is called', function() {
    it('should call registerRunnerEvents with runner event dispatch passed in', function() {
      const initializeRunnerEventDispatch = require('../../../../../' +
        'lib/runner/runner-event-dispatch/initialize-runner-event-dispatch.js');

      initializeRunnerEventDispatch();

      expect(registerRunnerEvents.args).to.deep.equal([
        [runnerEventDispatch],
      ]);
    });
  });
});
