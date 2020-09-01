'use strict';

const fs = require('fs');
const path = require('path');

let findFiles;

module.exports = findFiles = {
  search(paths, callback) {
    const testCases = new Set();

    for (const aPath of paths) {
      const absolutePath = path.resolve(process.cwd(), aPath);
      const stats = fs.statSync(absolutePath);

      if (stats.isDirectory()) {
        const files = fs.readdirSync(absolutePath);

        const absolutePaths = files.map(function(aPath) {
          return path.resolve(absolutePath, aPath);
        });

        let cases;
        findFiles.search(absolutePaths, function(files) {
          cases = files;
        });

        cases.map(function(aCase) {
          testCases.add(aCase);
        });
      } else if (stats.isFile()) {
        testCases.add(absolutePath);
      }
    }
    return callback([...testCases.values()]);
  },
};
