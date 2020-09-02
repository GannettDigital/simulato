'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/possible-actions.js', function() {
  describe('on file require', function() {
    let Emitter;
    let possibleActions;
    let plannerEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/possible-actions.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
          myObject.on = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with possibleActions and plannerEventDispatch the parameters', function() {
      possibleActions = require('../../../../lib/planner/possible-actions.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          possibleActions,
          plannerEventDispatch,
        ],
      ]);
    });
  });

  describe('get', function() {
    let Emitter;
    let next;
    let callback;
    let node;
    let possibleActions;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/possible-actions.js');

      callback = sinon.stub();
      next = sinon.stub();
      node = {
        state: {
          getComponents: sinon.stub(),
          getState: sinon.stub(),
        },
        dataStore: {
          retrieveAll: sinon.stub(),
        },
      };
      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
          myObject.on = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

      possibleActions = require('../../../../lib/planner/possible-actions.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call node.state.getComponents once with no arguments', function() {
      node.state.getComponents.returns([]);
      const generator = possibleActions.get(node.state, callback);

      generator.next();
      generator.next(next);

      expect(node.state.getComponents.args).to.deep.equal([[]]);
    });
  });
});
