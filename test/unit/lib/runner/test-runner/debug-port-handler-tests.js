'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/debug-port-handler.js', function() {
  describe('getPort', function() {
    let debugPortHandler;
    let callback;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/debug-port-handler.js');

      callback = sinon.stub();

      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('portscanner', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      debugPortHandler = require('../../../../../lib/runner/test-runner/debug-port-handler.js');
      debugPortHandler._findPort = sinon.stub();
      debugPortHandler._startPort = 3000;
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      delete process.env.DEBUG_PORT;
    });

    it('should push the passed in callback to debugPortHandler._portsToGet', function() {
      const callback2 = sinon.stub();
      debugPortHandler._portsToGet = [callback2];

      debugPortHandler.getPort(callback);

      expect(debugPortHandler._portsToGet).to.deep.equal([callback2, callback]);
    });

    describe('if debugPortHandler._startPort is not set', function() {
      it('should call configHandler.get with \'debugPort\'', function() {
        delete debugPortHandler._startPort;

        debugPortHandler.getPort(callback);

        expect(configHandler.get.args).to.deep.equal([['debugPort']]);
      });

      describe('if the config contains debugPort', function() {
        it('should set ._currentPort to the configs debugPort', function() {
          configHandler.get.returns(2121);
          delete debugPortHandler._startPort;

          debugPortHandler.getPort(callback);

          expect(debugPortHandler._currentPort).to.equal(2121);
        });

        it('should set ._startPort to the configs debugPort', function() {
          configHandler.get.returns(2121);
          delete debugPortHandler._startPort;

          debugPortHandler.getPort(callback);

          expect(debugPortHandler._startPort).to.equal(2121);
        });
      });

      describe('if process.env.DEBUG_PORT is NOT an int', function() {
        it('should set ._currentPort to the default of 32489', function() {
          delete debugPortHandler._startPort;

          debugPortHandler.getPort(callback);

          expect(debugPortHandler._currentPort).to.equal(32489);
        });

        it('should set ._startPort to the default of 32489', function() {
          delete debugPortHandler._startPort;

          debugPortHandler.getPort(callback);

          expect(debugPortHandler._startPort).to.equal(32489);
        });
      });
    });

    describe('if debugPortHandler._currentlyGettingPort is false', function() {
      it('should set debugPortHandler._currentlyGettingPort to true', function() {
        debugPortHandler.getPort(callback);

        expect(debugPortHandler._currentlyGettingPort).to.equal(true);
      });

      it('should call debugPortHandler._findPort once with no args', function() {
        debugPortHandler.getPort(callback);

        expect(debugPortHandler._findPort.args).to.deep.equal([[]]);
      });
    });

    describe('if debugPortHandler._currentlyGettingPort is true', function() {
      it('should not call debugPortHanlder._findPort', function() {
        debugPortHandler._currentlyGettingPort = true;

        debugPortHandler.getPort(callback);

        expect(debugPortHandler._findPort.callCount).to.equal(0);
      });
    });
  });

  describe('_findPort', function() {
    let debugPortHandler;
    let portscanner;
    let callback;
    let _findPort;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/debug-port-handler.js');

      portscanner = {
        findAPortNotInUse: sinon.stub(),
      };
      callback = sinon.stub();
      global.SimulatoError = {
        RUNNER: {
          CHILD_SPAWN_ERROR: sinon.stub(),
        },
      };

      mockery.registerMock('portscanner', portscanner);
      mockery.registerMock('../../util/config/config-handler.js', {});

      debugPortHandler = require('../../../../../lib/runner/test-runner/debug-port-handler.js');
      debugPortHandler._portsToGet = [callback];
      debugPortHandler._sendPort = sinon.stub();
      debugPortHandler._startPort = 1000;
      debugPortHandler._currentPort = 1000;
      _findPort = debugPortHandler._findPort;
      debugPortHandler._findPort = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      delete global.SimulatoError;
    });

    it('should call portscanner.findAPortNotInUse once', function() {
      _findPort();

      expect(portscanner.findAPortNotInUse.callCount).to.equal(1);
    });

    it('should call portscanner.findAPortNotInUse with ' +
      '._currentPort, ._maxPort, and \'127.0.0.1\' as the first 3 params', function() {
      _findPort();

      expect(portscanner.findAPortNotInUse.args[0].slice(0, 3)).to.deep.equal([
        1000,
        65535,
        '127.0.0.1',
      ]);
    });

    it('should call portscanner.findAPortNotInUse with a function as the 4th param', function() {
      _findPort();

      expect(portscanner.findAPortNotInUse.args[0][3]).to.be.a('function');
    });

    describe('when the callback for portscanner.findAPortNotInUse is called', function() {
      describe('if there was an error returned', function() {
        it('should throw simulato CHILD_SPAWN_ERROR', function() {
          const message = `Error was thrown`;
          SimulatoError.RUNNER.CHILD_SPAWN_ERROR.throws(
              {message},
          );
          const err = new Error('im an error being thrown');
          portscanner.findAPortNotInUse.callsArgWith(3, err);

          expect(_findPort.bind(null)).to.throw('Error was thrown');
        });
      });

      describe('if the returned port is 65535', function() {
        it('should set debugPortHandler._currentPort to debugPortHandler._startPort', function() {
          portscanner.findAPortNotInUse.callsArgWith(3, null, 65535);
          debugPortHandler._currentPort = 33333;

          _findPort();

          expect(debugPortHandler._currentPort).to.equal(1000);
        });
      });

      describe('if the returned port is NOT 65535', function() {
        it('should set debugPortHandler._currentPort to the returned port + 1', function() {
          portscanner.findAPortNotInUse.callsArgWith(3, null, 1004);
          debugPortHandler._currentPort = 33333;

          _findPort();

          expect(debugPortHandler._currentPort).to.equal(1005);
        });
      });

      it('shoudl call debugPortHandler._sendPort with the returned port ' +
        'and the callback in debugPortHandler._portsToGet[0]', function() {
        portscanner.findAPortNotInUse.callsArgWith(3, null, 5000);

        _findPort();

        expect(debugPortHandler._sendPort.args).to.deep.equal([[5000, callback]]);
      });

      describe('if debugPortHandler._portsToGet is NOT empty', function() {
        it('shoudl call debugPortHandler._findPort with no args', function() {
          portscanner.findAPortNotInUse.callsArgWith(3, null, 5000);
          debugPortHandler._portsToGet.push(sinon.stub());

          _findPort();

          expect(debugPortHandler._findPort.args).to.deep.equal([[]]);
        });
      });

      describe('if debugPortHandler._portsToGet is empty', function() {
        it('should set debugPortHandler._currentlyGettingPort to false', function() {
          portscanner.findAPortNotInUse.callsArgWith(3, null, 5000);

          _findPort();

          expect(debugPortHandler._currentlyGettingPort).to.equal(false);
        });
      });
    });
  });

  describe('_sendPort', function() {
    let debugPortHandler;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/debug-port-handler.js');

      callback = sinon.stub();

      mockery.registerMock('portscanner', {});
      mockery.registerMock('../../util/config/config-handler.js', {});

      debugPortHandler = require('../../../../../lib/runner/test-runner/debug-port-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call the passed in callback with the passed in port', function() {
      debugPortHandler._sendPort(3402, callback);

      expect(callback.args).to.deep.equal([[3402]]);
    });
  });
});
