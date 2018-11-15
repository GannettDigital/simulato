'use strict';

const fs = require('fs');
const path = require('path');
const configHandler = require('../util/config/config-handler.js');

module.exports = function writePlansToDisk(plans) {
  let date = Date.now();
  let fileCount = 1;
  const outputPath = configHandler.get('outputPath');
  for (let plan of plans) {
    let filePath = path.resolve(outputPath,
        `${date}-simulato-${fileCount++}_${plans.length}.json`);
    fs.writeFileSync(filePath, JSON.stringify(plan.testCase));
  }
  console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
