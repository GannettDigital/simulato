'use strict';

const webdriver = require('selenium-webdriver');
const SauceLabs = require('saucelabs').default;
const configHandler = require('../util/config/config-handler.js');
const _ = require('lodash');

let driverHandler;

module.exports = driverHandler = {
  _failed: false,
  _capabilities: {},
  setup() {
    // Create blank driver.
    let driver = new webdriver.Builder();

    // Set default browser to chrome
    driverHandler._capabilities.browserName = 'chrome';

    /*
    *  If using sauce:
    *    set in defaults of required fields for sauce: browserName, browserVersion, and plafform.
    *    set name, username, accesskey
    *    Note: tunnel-identifier was set previously into config.driver.capabilities['tunnel-identifier']
    *          this means, that the tunnel-identifer will be set when the configs driver.capabilities are merged in
    */
    if (configHandler.get('driver.saucelabs')) {
      const sauceDefaults = {
        'name': configHandler.get('testName'),
        'browserName': 'chrome',
        'version': 'latest',
        'platform': 'Windows 10',
        'username': process.env.SAUCE_USERNAME,
        'accessKey': process.env.SAUCE_ACCESS_KEY,
      };

      _.merge(driverHandler._capabilities, sauceDefaults);
    }

    // If custom capabilities are set, merge in capabilities (overrides defaults)
    if (configHandler.get('driver.capabilities')) {
      _.merge(driverHandler._capabilities, configHandler.get('driver.capabilities'));
    }

    // Set capabilities
    driver = driver.withCapabilities(driverHandler._capabilities);

    // If set to using sauce, set server, and do not set browser
    if (configHandler.get('driver.saucelabs')) {
      driver = driver.usingServer(
          `http://${driverHandler._capabilities.username}:${driverHandler._capabilities.accessKey}` +
          '@ondemand.saucelabs.com:80/wd/hub',
      );
    }

    // If usingServer option set, call driver.forBrowser WILL OVERRIDE SAUCE DEFAULT
    if (configHandler.get('driver.usingServer')) {
      driver = driver.usingServer(configHandler.get('driver.usingServer'));
    }

    driver = driver.build();
    global.driver = driver;
  },
  handleError() {
    driverHandler._failed = true;
  },
  async quit() {
    if (configHandler.get('driver.saucelabs')) {
      let sessionid;
      try {
        sessionid = await driver.getSession();
      } catch (error) {
        return process.exit(1);
      }
      driver.sessionID = sessionid.id_;

      const sauceLabsApi = new SauceLabs({
        username: driverHandler._capabilities.username,
        password: driverHandler._capabilities.accessKey,
      });
      await sauceLabsApi.updateJob(driver.sessionID, {
        passed: !driverHandler._failed,
      });
    }
    await driver.quit();
  },
};
