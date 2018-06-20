'use strict';

const sauceConnectLauncher = require('sauce-connect-launcher');
const configHandler = require('./config-handler.js');

let saucelabs;

module.exports = saucelabs = {
    connect(callback) {
        console.log('Creating sauce connect tunnel...');
        sauceConnectLauncher({
            username: configHandler.get('sauceCapabilities.username') || process.env.SAUCE_USERNAME,
            accessKey: configHandler.get('sauceCapabilities.accesskey') || process.env.SAUCE_ACCESS_KEY,
            tunnelIdentifier: configHandler.get('tunnelIdentifier'),
        }, function(error, sauceConnectProcess) {
            if (error) {
                return callback(error);
            } else {
                console.log('Sauce Connect process connected');
                saucelabs._sauceConnectProcess = sauceConnectProcess;
                callback();
            }
        });
    },
    close() {
        console.log('Closing sauce connect tunnel...');
        saucelabs._sauceConnectProcess.close(function() {
            console.log('Sauce Connect process closed');
        });
    },
};
