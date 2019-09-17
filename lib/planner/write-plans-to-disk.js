'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../util/config/config-handler.js');


module.exports = function writePlansToDisk(plans) {
  const outputPath = configHandler.get('outputPath');
  for (let plan of plans) {
    const crypto = require('crypto');
    const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
    let testName = `simulato`+`--${sha256(plan.toString())}.json`;
    let filePath = path.resolve(outputPath, testName);
    fs.writeFileSync(filePath, JSON.stringify(plan));
  }
  console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
