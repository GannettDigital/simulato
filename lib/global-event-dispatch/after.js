'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const configHandler = require('../../util/config-handler.js');

module.exports = function() {
    let functions = [];

    if (configHandler.get('saucelabs')) {
        functions.push(Saucelabs.close);
    }

    concurrent(functions, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }
    });
};
