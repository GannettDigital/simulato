'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/global-event-dispatch/initialize-global-event-dispatch.js', function() {
  let globalEventDispatch;
  let registerGlobalEvents;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/global-event-dispatch/initialize-global-event-dispatch.js');

    globalEventDispatch = {};
    registerGlobalEvents = sinon.stub();

    mockery.registerMock('./global-event-dispatch.js', globalEventDispatch);
    mockery.registerMock('./register-global-events.js', registerGlobalEvents);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the exported function is called', function() {
    it('should call registerGlobalEvents with global event dispatch passed in', function() {
      let initializeglobalEventDispatch = require('../../../../lib/'
        + 'global-event-dispatch/initialize-global-event-dispatch.js');

      initializeglobalEventDispatch();

      expect(registerGlobalEvents.args).to.deep.equal([
        [globalEventDispatch],
      ]);
    });
  });
});
