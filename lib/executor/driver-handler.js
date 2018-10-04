'use strict';

const webdriver = require('selenium-webdriver');
const Saucelabs = require('saucelabs');
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
    *    set name, username, accesskey, and tunnelIdentifier
    */
    if (configHandler.get('driver.saucelabs')) {
      let sauceDefaults = {
        'name': configHandler.get('testName'),
        'browserName': 'chrome',
        'version': 'latest',
        'platform': 'Windows 10',
        'username': process.env.SAUCE_USERNAME,
        'accessKey': process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': configHandler.get('driver.tunnelIdentifier'),
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
          '@ondemand.saucelabs.com:80/wd/hub'
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
  quit() {
    let saucelabsApi = new Saucelabs({
      username: driverHandler._capabilities.username,
      password: driverHandler._capabilities.accessKey,
    });
    driver.getSession().then(
        function(sessionid) {
          driver.sessionID = sessionid.id_;
          saucelabsApi.updateJob(driver.sessionID, {
            passed: !driverHandler._failed,
          }, function() {
            driver.quit();
          });
        },
        function() {
          process.exit(1);
        });
  },
};
