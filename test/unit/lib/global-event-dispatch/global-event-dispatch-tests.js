'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/global-event-dispatch/global-event-dispatch.js', function() {
  let Emitter;
  let result;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/global-event-dispatch/global-event-dispatch.js');

    Emitter = {
      mixIn(myObject) {
        myObject.mixedIn = true;
      },
    };
    sinon.spy(Emitter, 'mixIn');

    mockery.registerMock('../util/emitter.js', Emitter);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the file is required', function() {
    it('should call Emitter.mixIn once with the object to be mixed in', function() {
      require('../../../../lib/global-event-dispatch/global-event-dispatch.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          {
            mixedIn: true,
          },
        ],
      ]);
    });

    it('should export the mixed in object', function() {
      result = require('../../../../lib/global-event-dispatch/global-event-dispatch.js');

      expect(result).to.deep.equal({mixedIn: true});
    });
  });
});
