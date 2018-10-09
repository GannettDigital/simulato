'use strict';

const sauceConnectLauncher = require('sauce-connect-launcher');
const configHandler = require('./config/config-handler.js');

let saucelabs;

module.exports = saucelabs = {
  connect(callback) {
    console.log('Creating sauce connect tunnel...');
    sauceConnectLauncher({
      username: configHandler.get('driver.capabilities.username') || process.env.SAUCE_USERNAME,
      accessKey: configHandler.get('driver.capabilities.accessKey') || process.env.SAUCE_ACCESS_KEY,
      tunnelIdentifier: configHandler.get('driver.capabilities.tunnel-identifier'),
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
