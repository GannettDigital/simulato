'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function findFiles(paths, callback) {
    let testCases = new Set();

    for (let aPath of paths) {
        let absolutePath = path.resolve(process.cwd(), aPath);
        let stats = fs.statSync(absolutePath);

        if (stats.isDirectory()) {
            let files = fs.readdirSync(absolutePath);

            let absolutePaths = files.map(function(aPath) {
                return path.resolve(absolutePath, aPath);
            });

            let cases;
            findFiles(absolutePaths, function(files) {
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
};
