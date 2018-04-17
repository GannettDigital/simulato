'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/saucelabs', function() {
  describe('connect', function() {
    let saucelabs;
    let sauceConnectLauncher;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/saucelabs.js');

      sauceConnectLauncher = sinon.stub();
      callback = sinon.stub();
      sinon.spy(console, 'log');

      process.env.SAUCE_USERNAME = 'sauceUsername',
      process.env.SAUCE_ACCESS_KEY = 'sauceAccessKey',
      process.env.TUNNEL_IDENTIFIER = 'tunnelIdentifier',

      mockery.registerMock('sauce-connect-launcher', sauceConnectLauncher);

      saucelabs = require('../../../../lib/util/saucelabs.js');
    });

    afterEach(function() {
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      delete process.env.TUNNEL_IDENTIFIER;
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call sauceConnectLauncher once', function() {
      saucelabs.connect(callback);

      expect(sauceConnectLauncher.callCount).to.equal(1);
    });

    it('should call sauceConnectLauncher with an object as the first argument containing '
    + 'username, accessKey, and tunnelIdentifier equal to their respective process.env varibles', function() {
      saucelabs.connect(callback);

      expect(sauceConnectLauncher.args[0][0]).to.deep.equal({
        username: 'sauceUsername',
        accessKey: 'sauceAccessKey',
        tunnelIdentifier: 'tunnelIdentifier',
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
        it(`should call console.log with 'Sauce Connect process connected'`, function() {
          sauceConnectLauncher.callsArgWith(1, null, {});

          saucelabs.connect(callback);

          expect(console.log.args).to.deep.equal([[
            'Sauce Connect process connected',
          ]]);
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

        expect(console.log.args).to.deep.equal([[
          'Sauce Connect process closed',
        ]]);
      });
    });
  });
});
