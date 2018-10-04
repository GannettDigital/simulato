'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/saucelabs', function() {
  describe('connect', function() {
    let saucelabs;
    let sauceConnectLauncher;
    let callback;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/saucelabs.js');

      sauceConnectLauncher = sinon.stub();
      callback = sinon.stub();
      sinon.spy(console, 'log');
      configHandler = {
        get: sinon.stub(),
      };

      process.env.SAUCE_USERNAME = 'sauceUsername',
      process.env.SAUCE_ACCESS_KEY = 'sauceAccessKey',

      mockery.registerMock('sauce-connect-launcher', sauceConnectLauncher);
      mockery.registerMock('./config/config-handler.js', configHandler);

      saucelabs = require('../../../../lib/util/saucelabs.js');
    });

    afterEach(function() {
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call console.log to say sauce connect tunnel is connecting', function() {
      saucelabs.connect(callback);

      expect(console.log.args[0]).to.deep.equal([
        'Creating sauce connect tunnel...',
      ]);
    });

    it('should call console.log once', function() {
      saucelabs.connect(callback);

      expect(console.log.callCount).to.equal(1);
    });

    it('should call sauceConnectLauncher once', function() {
      saucelabs.connect(callback);

      expect(sauceConnectLauncher.callCount).to.equal(1);
    });

    it('should call configHandler.get 3 times', function() {
      saucelabs.connect(callback);

      expect(configHandler.get.callCount).to.equal(3);
    });

    it('should call configHandler.get with driver.capabilities.username', function() {
      saucelabs.connect(callback);

      expect(configHandler.get.args[0]).to.deep.equal(['driver.capabilities.username']);
    });

    it('should call configHandler.get with driver.capabilities.accessKey', function() {
      saucelabs.connect(callback);

      expect(configHandler.get.args[1]).to.deep.equal(['driver.capabilities.accessKey']);
    });

    it('should call configHandler.get with driver.capabilities.tunnel-identifier', function() {
      saucelabs.connect(callback);

      expect(configHandler.get.args[2]).to.deep.equal(['driver.capabilities.tunnel-identifier']);
    });

    it('should call sauceConnectLauncher with an object as the first argument containing '
    + 'username, accessKey, and tunnelIdentifier equal to their respective config values', function() {
      configHandler.get.onCall(0).returns('configUsername');
      configHandler.get.onCall(1).returns('configAccessKey');
      configHandler.get.onCall(2).returns('tunnelIdentifier');

      saucelabs.connect(callback);

      expect(sauceConnectLauncher.args[0][0]).to.deep.equal({
        username: 'configUsername',
        accessKey: 'configAccessKey',
        tunnelIdentifier: 'tunnelIdentifier',
      });
    });

    describe('if the config sauceCapabilities.username is falsey', function() {
      it('should call sauceConnectLauncher with an object as the first argument containing '
      + 'username from process.env', function() {
        configHandler.get.onCall(0).returns(undefined);
        configHandler.get.onCall(1).returns('configAccessKey');
        configHandler.get.onCall(2).returns('tunnelIdentifier');

        saucelabs.connect(callback);

        expect(sauceConnectLauncher.args[0][0]).to.deep.equal({
          username: 'sauceUsername',
          accessKey: 'configAccessKey',
          tunnelIdentifier: 'tunnelIdentifier',
        });
      });
    });

    describe('if the config sauceCapabilities.accessKey is falsey', function() {
      it('should call sauceConnectLauncher with an object as the first argument containing '
      + 'accessKey from process.env', function() {
        configHandler.get.onCall(0).returns('configUsername');
        configHandler.get.onCall(1).returns(undefined);
        configHandler.get.onCall(2).returns('tunnelIdentifier');

        saucelabs.connect(callback);

        expect(sauceConnectLauncher.args[0][0]).to.deep.equal({
          username: 'configUsername',
          accessKey: 'sauceAccessKey',
          tunnelIdentifier: 'tunnelIdentifier',
        });
      });
    });


    it('should call sauceConnectLauncher with a callback function as second argument', function() {
      saucelabs.connect(callback);

      expect(sauceConnectLauncher.args[0][1]).to.be.a('function');
    });

    describe('when the sauceConnectLauncher callback is being called', function() {
      describe('if an error was passed back', function() {
        it('should call the passed in callback function with the error as the argument', function() {
          let error = new Error('connect error');
          sauceConnectLauncher.callsArgWith(1, error, {});

          saucelabs.connect(callback);

          expect(callback.args).to.deep.equal([[
            error,
          ]]);
        });
      });

      describe('if no error was passed back', function() {
        it('should call console.log twice', function() {
          sauceConnectLauncher.callsArgWith(1, null, {});

          saucelabs.connect(callback);

          expect(console.log.callCount).to.equal(2);
        });

        it(`should call console.log with 'Sauce Connect process connected'`, function() {
          sauceConnectLauncher.callsArgWith(1, null, {});

          saucelabs.connect(callback);

          expect(console.log.args[1]).to.deep.equal([
            'Sauce Connect process connected',
          ]);
        });

        it('should set sauceLabs._sauceConnectProcess to the passed back sauceConnectProcess', function() {
          sauceConnectLauncher.callsArgWith(1, null, {foo: 'bar'});

          saucelabs.connect(callback);

          expect(saucelabs._sauceConnectProcess).to.deep.equal({foo: 'bar'});
        });

        it('should call the passed in callback once with no args', function() {
          sauceConnectLauncher.callsArgWith(1, null, {});

          saucelabs.connect(callback);

          expect(callback.args).to.deep.equal([[]]);
        });
      });
    });
  });

  describe('close', function() {
    let saucelabs;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/saucelabs.js');

      sinon.spy(console, 'log');

      mockery.registerMock('sauce-connect-launcher', {});
      mockery.registerMock('./config/config-handler.js', {});

      saucelabs = require('../../../../lib/util/saucelabs.js');
      saucelabs._sauceConnectProcess = {
        close: sinon.stub(),
      };
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it(`should call console.log with 'Closing sauce connect tunnel...'`, function() {
      saucelabs.close();

      expect(console.log.args[0]).to.deep.equal([
        'Closing sauce connect tunnel...',
      ]);
    });

    it('should call console.log once', function() {
      saucelabs.close();

      expect(console.log.callCount).to.equal(1);
    });

    it('should call saucelabs._sauceConnectProcess.close once', function() {
      saucelabs.close();

      expect(saucelabs._sauceConnectProcess.close.callCount).to.equal(1);
    });

    it('should call saucelabs._sauceConnectProcess.close with a function as first param', function() {
      saucelabs.close();

      expect(saucelabs._sauceConnectProcess.close.args[0][0]).to.be.a('function');
    });

    describe('when saucelabs._sauceConnectProcess.close callback is called', function() {
      it(`should call console.log with 'Sauce Connect process closed'`, function() {
        saucelabs._sauceConnectProcess.close.callsArg(0);

        saucelabs.close();

        expect(console.log.args[1]).to.deep.equal([
          'Sauce Connect process closed',
        ]);
      });

      it('should call console.log twice', function() {
        saucelabs._sauceConnectProcess.close.callsArg(0);

        saucelabs.close();

        expect(console.log.callCount).to.equal(2);
      });
    });
  });
});
