'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/executor-event-dispatch/executor-event-dispatch.js', function() {
    let Emitter;
    let globalEventDispatch;
    let result;
  
    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/executor/executor-event-dispatch/executor-event-dispatch.js');
  
      Emitter = {
        mixIn(myObject) {
          myObject.mixedIn = true;
        },
      };
      sinon.spy(Emitter, 'mixIn');
      globalEventDispatch = sinon.stub();
  
      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../global-event-dispatch/global-event-dispatch.js', globalEventDispatch);
    });
  
    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });
  
    describe('when the file is required', function() {
      it('should call Emitter.mixIn once with an the object to be mixed and the globalEventDispatch', function() {
        require('../../../../../lib/executor/executor-event-dispatch/executor-event-dispatch.js');
  
        expect(Emitter.mixIn.args).to.deep.equal([
          [
            {
              mixedIn: true,
            },
            globalEventDispatch,
          ],
        ]);
      });
  
      it('should export the mixed in object', function() {
        result = require('../../../../../lib/executor/executor-event-dispatch/executor-event-dispatch.js');
  
        expect(result).to.deep.equal({mixedIn: true});
      });
    });
});
