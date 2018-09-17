'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/executor-event-dispatch/initialize-executor-event-dispatch.js', function() {
  let executorEventDispatch;
  let registerExecutorEvents;
  let initializeExecutorEventDispatch;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable(
        '../../../../../lib/executor/executor-event-dispatch/initialize-executor-event-dispatch.js');

    executorEventDispatch = sinon.stub();
    registerExecutorEvents = sinon.stub();

    mockery.registerMock('./executor-event-dispatch.js', executorEventDispatch);
    mockery.registerMock('./register-executor-events.js', registerExecutorEvents);

    initializeExecutorEventDispatch =
            require('../../../../../lib/executor/executor-event-dispatch/initialize-executor-event-dispatch.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.deregisterAll();
  });

  describe('when the exported function is called', function() {
    it('should registerExecutorEvents once with the executorEventDispatch as the parameter', function() {
      initializeExecutorEventDispatch();

      expect(registerExecutorEvents.args).to.deep.equal([
        [executorEventDispatch],
      ]);
    });
  });
});
