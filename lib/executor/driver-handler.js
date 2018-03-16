'use strict';

const webdriver = require('selenium-webdriver');
const Saucelabs = require('saucelabs');
const saucelabsApi = new Saucelabs({
    username: process.env.SAUCE_USERNAME,
    password: process.env.SAUCE_ACCESS_KEY,
});

let driverHandler;

module.exports = driverHandler = {
    _failed: false,
    locally() {
        const driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();

        global.driver = driver;
    },
    inSaucelabs() {
        let capabilities;
        if (process.env.SAUCE_CONFIG) {
           capabilities = JSON.parse(process.env.SAUCE_CONFIG);
        } else {
        capabilities = {
            'name': process.env.TEST_NAME,
            'browserName': 'chrome',
            'platform': 'Windows 10',
            'version': '63.0',
            'username': process.env.SAUCE_USERNAME,
            'accessKey': process.env.SAUCE_ACCESS_KEY,
            'tunnel-identifier': process.env.TUNNEL_IDENTIFIER,
            'customData': {
                        'build': process.env.BUILD_NUMBER,
                        'release': process.env.RELEASE_VERSION,
                        'commithash': process.env.COMMIT_HASH,
                        'environment': process.env.NODE_ENV,
                    }};
                }
        const driver = new webdriver.Builder()
            .withCapabilities(capabilities)
            .usingServer(
            `http://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.saucelabs.com:80/wd/hub`)
            .build();

        global.driver = driver;
    },
    handleError() {
        driverHandler._failed = true;
    },
    quit() {
        driver.getSession().then(function(sessionid) {
            driver.sessionID = sessionid.id_;
            saucelabsApi.updateJob(driver.sessionID, {
                    passed: !driverHandler._failed,
                }, function() {
                    driver.quit();
                });
        });
    },
};
