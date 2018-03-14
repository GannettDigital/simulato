'use strict';

const sauceConnectLauncher = require('sauce-connect-launcher');

let saucelabs;

module.exports = saucelabs = {
    connect(callback) {
        sauceConnectLauncher({
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            tunnelIdentifier: process.env.TUNNEL_IDENTIFIER,
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
        saucelabs._sauceConnectProcess.close(function() {
            console.log('Sauce Connect process closed');
        });
    },
};
