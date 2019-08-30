'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const configHandler = require('../util/config/config-handler.js');

module.exports = function writePlansToDisk(plans) {
  // let date = Date.now();
  // let fileCount = 1;
  const outputPath = configHandler.get('outputPath');
  for (let plan of plans) {
    let filePath = path.resolve(outputPath,
        (function generateTestName(plan) {
          // let filteredPlan = _.filter(plan, function(o) {
          //   return (
          //     (!o.name.toLowerCase().includes('navigateToPresto'.toLowerCase())) &&
          //     (!o.name.toLowerCase().includes('NAVIGATE_TO_PRESTO'.toLowerCase())));
          // });
          const crypto = require('crypto');
          const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

          return `simulato` +
          // `---${filteredPlan[0].name}`+
          // `-->${filteredPlan[filteredPlan.length-1].name}`+
          `--${sha256(plan.toString())}`;
        })(plan));

    // `${date}-simulato-${fileCount++}_${plans.length}.json`);

    // fs.writeFileSync(filePath, JSON.stringify(plan.testCase));
    console.log(filePath.length);
    fs.writeFileSync(filePath, JSON.stringify(plan));
  }
  console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
