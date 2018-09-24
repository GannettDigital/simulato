'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/planner-event-dispatch/initialize-planner-event-dispatch.js', function() {
  let plannerEventDispatch;
  let registerPlannerEvents;
  let initializeplannerEventDispatch;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable(
        '../../../../../lib/planner/planner-event-dispatch/initialize-planner-event-dispatch.js'
    );

    plannerEventDispatch = sinon.stub();
    registerPlannerEvents = sinon.stub();

    mockery.registerMock('./planner-event-dispatch.js', plannerEventDispatch);
    mockery.registerMock('./register-planner-events.js', registerPlannerEvents);

    initializeplannerEventDispatch =
      require('../../../../../lib/planner/planner-event-dispatch/initialize-planner-event-dispatch.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.deregisterAll();
  });

  describe('when the exported function is called', function() {
    it('should registerPlannerEvents once with the plannerEventDispatch as the parameter', function() {
      initializeplannerEventDispatch();

      expect(registerPlannerEvents.args).to.deep.equal([
        [plannerEventDispatch],
      ]);
    });
  });
});
