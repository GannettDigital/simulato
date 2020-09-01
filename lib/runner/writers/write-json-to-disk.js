'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../../util/config/config-handler.js');

module.exports = function(report) {
  const date = Date.now();
  const filePath = path.resolve(configHandler.get('reportPath'), `${date}-test-report.json`);
  fs.writeFileSync(filePath, JSON.stringify(report));
};
