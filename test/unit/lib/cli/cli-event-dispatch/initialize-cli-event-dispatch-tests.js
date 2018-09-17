'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/cli-event-dispatch/initialize-cli-event-dispatch.js', function() {
  let cliEventDispatch;
  let registerCliEvents;
  let initializecliEventDispatch;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable(
        '../../../../../lib/cli/cli-event-dispatch/initialize-cli-event-dispatch.js'
    );

    cliEventDispatch = sinon.stub();
    registerCliEvents = sinon.stub();

    mockery.registerMock('./cli-event-dispatch.js', cliEventDispatch);
    mockery.registerMock('./register-cli-events.js', registerCliEvents);

    initializecliEventDispatch =
      require('../../../../../lib/cli/cli-event-dispatch/initialize-cli-event-dispatch.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.deregisterAll();
  });

  describe('when the exported function is called', function() {
    it('should registerCliEvents once with the cliEventDispatch as the parameter', function() {
      initializecliEventDispatch();

      expect(registerCliEvents.args).to.deep.equal([
        [cliEventDispatch],
      ]);
    });
  });
});
