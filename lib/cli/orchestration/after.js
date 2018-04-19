'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;

module.exports = function() {
    let functions = [];

    if (process.env.SAUCE_LABS === 'true') {
        functions.push(Saucelabs.close);
    }

    concurrent(functions, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }
    });
};
