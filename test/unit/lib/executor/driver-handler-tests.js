'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/driver-handler.js', function() {
  describe('on file being require', function() {
    let SauceLabs;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

      SauceLabs = {
        default: sinon.stub(),
      };

      mockery.registerMock('selenium-webdriver', {});
      mockery.registerMock('saucelabs', SauceLabs);
      mockery.registerMock('lodash', {});
      mockery.registerMock('../util/config/config-handler.js', {});
    });

    afterEach(function() {
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });
  });

  describe('setup', function() {
    let webdriver;
    let webdriverBuilder1;
    let webdriverBuilder2;
    let webdriverBuilder3;
    let driverHandler;
    let configHandler;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

      configHandler = {
        get: sinon.stub(),
      };
      _ = {
        merge: sinon.stub(),
      };
      webdriver = {
        Builder: sinon.stub(),
      };
      webdriverBuilder1 = {
        withCapabilities: sinon.stub(),
      };
      webdriverBuilder2 = {
        withCapabilities: sinon.stub(),
        usingServer: sinon.stub(),
        build: sinon.stub(),
      };
      webdriverBuilder3 = {
        build: sinon.stub(),
      };

      webdriver.Builder.returns(webdriverBuilder1);
      webdriverBuilder1.withCapabilities.returns(webdriverBuilder2);
      webdriverBuilder2.usingServer.returns(webdriverBuilder3);
      webdriverBuilder2.build.returns('driver2');
      webdriverBuilder3.build.returns('driver3');

      mockery.registerMock('selenium-webdriver', webdriver);
      mockery.registerMock('saucelabs', {});
      mockery.registerMock('lodash', _);
      mockery.registerMock('../util/config/config-handler.js', configHandler);

      driverHandler = require('../../../../lib/executor/driver-handler.js');
    });

    afterEach(function() {
      delete global.driver;
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should webdriver.Builder once with no parameters', function() {
      driverHandler.setup();

      expect(webdriver.Builder.args).to.deep.equal([[]]);
    });

    it('it should set driverHandler._capabilities.browserName to \'chrome\'', function() {
      driverHandler.setup();

      expect(driverHandler._capabilities.browserName).to.equal('chrome');
    });

    it('should call configHandler.get four times', function() {
      driverHandler.setup();

      expect(configHandler.get.callCount).to.equal(4);
    });

    it('should call configHandler.get with \'driver.saucelabs\'', function() {
      driverHandler.setup();

      expect(configHandler.get.args[0]).to.deep.equal(['driver.saucelabs']);
    });

    describe('if the configHandler.get(\'driver.saucelabs\') is truhty', function() {
      it('should call configHandler.get a total of 5 times', function() {
        configHandler.get.onCall(1).returns(true);

        driverHandler.setup();

        expect(configHandler.get.callCount).to.equal(5);
      });

      it('should call _.merge with the ._capabilities and the sauceDefaults', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('testName');
        process.env.SAUCE_USERNAME = 'sauceusername';
        process.env.SAUCE_ACCESS_KEY = 'accessKey';

        driverHandler.setup();

        expect(_.merge.args).to.deep.equal([
          [
            {
              'browserName': 'chrome',
            },
            {
              'accessKey': 'accessKey',
              'browserName': 'chrome',
              'name': 'testName',
              'platform': 'Windows 10',
              'username': 'sauceusername',
              'version': 'latest',
            },
          ],
        ]);
      });
    });

    it('should call configHandler.get with \'driver.capabilities\'', function() {
      driverHandler.setup();

      expect(configHandler.get.args[1]).to.deep.equal(['driver.capabilities']);
    });

    describe('if the configHandler.get(\'driver.capabilities\') is truhty', function() {
      it('should call _.merge with ._capabilities' +
          'and the results of configHandler.get(\'driver.capabilities\'', function() {
        configHandler.get.onCall(1).returns(true);
        configHandler.get.onCall(2).returns({config: 'capability'});

        driverHandler.setup();

        expect(_.merge.args).to.deep.equal([
          [
            {
              browserName: 'chrome',
            },
            {
              config: 'capability',
            },
          ],
        ]);
      });
    });

    it('should call driver.withCapabilities with ._capabilities', function() {
      driverHandler._capabilities = {
        custom: 'capabilitiy',
      };

      driverHandler.setup();

      expect(webdriverBuilder1.withCapabilities.args).to.deep.equal([[
        {
          custom: 'capabilitiy',
          browserName: 'chrome',
        },
      ]]);
    });

    it('should call configHandler.get with \'driver.saucelabs\' a second time', function() {
      driverHandler.setup();

      expect(configHandler.get.args[2]).to.deep.equal(['driver.saucelabs']);
    });

    describe('if configHander.get(\'driver.saucelabs\') is truthy', function() {
      it('should call driver.usingServer with the correct sauce server string', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('testName');
        configHandler.get.onCall(2).returns('tunnelID');
        configHandler.get.onCall(4).returns(true);
        driverHandler._capabilities.username = 'sauceusername';
        driverHandler._capabilities.accessKey = 'accessKey';

        driverHandler.setup();

        expect(webdriverBuilder2.usingServer.args).to.deep.equal([[
          'http://sauceusername:accessKey@ondemand.saucelabs.com:80/wd/hub',
        ]]);
      });
    });

    it('should call configHandler.get with \'driver.usingServer\' a second time', function() {
      driverHandler.setup();

      expect(configHandler.get.args[3]).to.deep.equal(['driver.usingServer']);
    });

    describe('if configHander.get(\'driver.usingServer\') is truthy', function() {
      it('should call configHandler.get a total of 5 times', function() {
        configHandler.get.onCall(3).returns(true);

        driverHandler.setup();

        expect(configHandler.get.callCount).to.equal(5);
      });

      it('should call driver.usingServer once with the result from' +
          'configHandler.get(\'driver.usingServer\')', function() {
        configHandler.get.onCall(3).returns(true);
        configHandler.get.onCall(4).returns('serverToUse');

        driverHandler.setup();

        expect(webdriverBuilder2.usingServer.args).to.deep.equal([['serverToUse']]);
      });
    });

    it('should call driver.build once with no params', function() {
      driverHandler.setup();

      expect(webdriverBuilder2.build.args).to.deep.equal([[]]);
    });

    it('should set global.driver to the driver returned from driver.build', function() {
      driverHandler.setup();

      expect(global.driver).to.equal('driver2');
    });
  });

  describe('handleError', function() {
    let driverHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

      mockery.registerMock('selenium-webdriver', {});
      mockery.registerMock('saucelabs', sinon.stub());
      mockery.registerMock('lodash', {});
      mockery.registerMock('../util/config/config-handler.js', {});

      driverHandler = require('../../../../lib/executor/driver-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set driverHandler._failed to the boolean true', function() {
      driverHandler.handleError();

      expect(driverHandler._failed).to.equal(true);
    });
  });

  describe('quit', function() {
    let SauceLabs;
    let sauceLabsApi;
    let driverHandler;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

      global.driver = {
        getSession: sinon.stub(),
        quit: sinon.stub(),
      };
      sauceLabsApi = {
        updateJob: sinon.stub(),
      };
      SauceLabs = sinon.stub().returns(sauceLabsApi);
      driver.getSession.resolves({id_: 'mySessionId'});
      sinon.stub(process, 'exit');
      configHandler = {
        get: sinon.stub().returns(true),
      };

      mockery.registerMock('selenium-webdriver', {});
      mockery.registerMock('saucelabs', {default: SauceLabs});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../util/config/config-handler.js', configHandler);

      driverHandler = require('../../../../lib/executor/driver-handler.js');
    });

    afterEach(function() {
      delete global.driver;
      process.exit.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('when configHandler.get returns true', function() {
      it('should call SauceLabs once with an object containing ' +
        'the username and accessKey from ._capabilities', async function() {
        driverHandler._capabilities = {
          username: 'sauceUsername',
          accessKey: 'sauceAccessKey',
        };

        await driverHandler.quit();

        expect(SauceLabs.args).to.deep.equal([
          [{
            username: 'sauceUsername',
            password: 'sauceAccessKey',
          }],
        ]);
      });

      it('should call driver.getSession once with no parameters', async function() {
        await driverHandler.quit();

        expect(driver.getSession.args).to.deep.equal([[]]);
      });

      describe('when the driver.getSession throws', function() {
        it('should call proces.exit with the exit code of 1', async function() {
          driver.getSession.rejects(new Error('error!!'));

          await driverHandler.quit();

          expect(process.exit.args).to.deep.equal([[1]]);
        });
      });

      it('should set driver.sessionID as session.id_ where session is the ' +
        'response from driver.getSession', async function() {
        await driverHandler.quit();

        expect(driver.sessionID).to.equal('mySessionId');
      });

      it('should call sauceLabsApi.updateJob once with the driver.sessionID and an object with passed' +
        'set to to negation driverHandler._failed', async function() {
        driverHandler._failed = false;

        await driverHandler.quit();

        expect(sauceLabsApi.updateJob.args).to.deep.equal([[
          'mySessionId',
          {passed: true},
        ]]);
      });
    });

    it('should call driver.quit once with no parameters', async function() {
      await driverHandler.quit();

      expect(driver.quit.args).to.deep.equal([[]]);
    });
  });
});
