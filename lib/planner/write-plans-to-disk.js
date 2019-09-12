'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../util/config/config-handler.js');

module.exports = function writePlansToDisk(plans) {
  const outputPath = configHandler.get('outputPath');
  for (let plan of plans) {
    let filePath = path.resolve(outputPath,
        (function generateTestName(plan) {
          const crypto = require('crypto');
          const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
          return `simulato`+`--${sha256(plan.toString())}`;
        })(plan));
    fs.writeFileSync(filePath, JSON.stringify(plan));
  }
  console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
