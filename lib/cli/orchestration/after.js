'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const configHandler = require('../../util/config/config-handler.js');

module.exports = function() {
  const functions = [];

  if (configHandler.get('driver.saucelabs')) {
    functions.push(Saucelabs.close);
  }

  concurrent(functions, function(error) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
  });
};
