'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function writePlansToDisk(plans) {
    let date = Date.now();
    let fileCount = 1;
    for (let plan of plans) {
        let filePath = path.resolve(process.env.PLANNER_OUTPUT_PATH,
            `${date}-simulato-${fileCount++}_${plans.length}.json`);
        fs.writeFileSync(filePath, JSON.stringify(plan.testCase));
    }
    console.log(`Generated and wrote ${plans.length} test(s) to disk`);
};
