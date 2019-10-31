'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../util/config/config-handler.js');
const crypto = require('crypto');

module.exports = function writePlansToDisk(plans) {
  const outputPath = configHandler.get('outputPath');
  let index = 0;
  for (let plan of plans) {
    const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
    let planString = JSON.stringify(Array.from(plan));
    let testName = `simulato`+`--${index}--${sha256(planString)}.json`;
    let filePath = path.resolve(outputPath, testName);
    fs.writeFileSync(filePath, planString);
    index += 1;
  }
  console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
