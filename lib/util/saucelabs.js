'use strict';

const sauceConnectLauncher = require('sauce-connect-launcher');
const configHandler = require('./config/config-handler.js');
const _ = require('lodash');

let saucelabs;


module.exports = saucelabs = {
  connect(callback) {
    console.log('Creating sauce connect tunnel...');

    sauceConnectLauncher( (function buildOpts() {
      let opts = {};

      let sauceConnArgs = configHandler.get('sauceConnectArgs');
      Object.assign(opts, sauceConnArgs);

      opts.verbose = opts.v || opts.vv || opts.verbose;

      if (opts.verbose && !opts.logger) {
        opts.logger = console.log;
      }

      opts.username = configHandler.get('driver.capabilities.username') || process.env.SAUCE_USERNAME;
      opts.accessKey = configHandler.get('driver.capabilities.accessKey') || process.env.SAUCE_ACCESS_KEY;
      opts.tunnelIdentifier = configHandler.get('driver.capabilities.tunnel-identifier');

      opts.verboseDebugging = configHandler.get('driver.capabilities.sauce-verbose-debugging');

      opts = _.pickBy(opts);
      return opts;
    })(), function(error, sauceConnectProcess) {
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
