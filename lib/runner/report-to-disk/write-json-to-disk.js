'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(report) {
  if (process.env.OUTPUT_PATH) {
    let date = Date.now();
    let filePath = path.resolve(process.env.OUTPUT_PATH, `${date}-test-report.json`);
    fs.writeFileSync(filePath, JSON.stringify(report));
  }
};
