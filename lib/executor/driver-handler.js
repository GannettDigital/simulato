'use strict';

const webdriver = require('selenium-webdriver');
const Saucelabs = require('saucelabs');
const configHandler = require('../util/config-handler.js');

let driverHandler;

module.exports = driverHandler = {
    _failed: false,
    locally() {
        const driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();

        global.driver = driver;
    },
    _navigateToAndModifyObject(modifyingObject, modifiedObject) {
        Object.keys(modifyingObject).forEach(function(k) {
            if (typeof modifyingObject[k] === 'object') {
                driverHandler._navigateToAndModifyObject(modifyingObject[k], modifiedObject[k]);
            } else {
                if (typeof modifiedObject[k] === 'undefined') {
                    modifiedObject[k] = {};
                }
                modifiedObject[k] = modifyingObject[k];
            }
        });
    },
    inSaucelabs() {
        let capabilities = {
            'name': configHandler.get('testName'),
            'browserName': 'chrome',
            'platform': 'Windows 10',
            'version': '63.0',
            'username': configHandler.get('sauceCapabilities.username') || process.env.SAUCE_USERNAME,
            'accessKey': configHandler.get('sauceCapabilities.accesskey') || process.env.SAUCE_ACCESS_KEY,
            'tunnel-identifier': configHandler.get('tunnelIdentifier'),
        };
        if (configHandler.get('sauceCapabilities')) {
           driverHandler._navigateToAndModifyObject(configHandler.get('sauceCapabilities'), capabilities);
        }

        const driver = new webdriver.Builder()
            .withCapabilities(capabilities)
            .usingServer(
            `http://${configHandler.get('sauceCapabilities.username') || process.env.SAUCE_USERNAME}` +
                `:${configHandler.get('sauceCapabilities.accesskey') || process.env.SAUCE_ACCESS_KEY}` +
                `@ondemand.saucelabs.com:80/wd/hub`)
            .build();

        global.driver = driver;
    },
    handleError() {
        driverHandler._failed = true;
    },
    quit() {
        let saucelabsApi = new Saucelabs({
            username: configHandler.get('sauceCapabilities.username') || process.env.SAUCE_USERNAME,
            password: configHandler.get('sauceCapabilities.accesskey') || process.env.SAUCE_ACCESS_KEY,
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
