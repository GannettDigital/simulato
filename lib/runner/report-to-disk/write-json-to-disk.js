'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../../util/config-handler.js');

module.exports = function(report) {
  if (configHandler.get('reportPath')) {
    let date = Date.now();
    let filePath = path.resolve(configHandler.get('reportPath'), `${date}-test-report.json`);
    fs.writeFileSync(filePath, JSON.stringify(report));
  }
};
