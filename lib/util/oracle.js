'use strict';

const assert = require('chai').assert;
const _ = require('lodash');

module.exports = {
    runAssertions(pageState, dataStore, assertions, callback) {
        let assertionObject = {
            pageState,
            dataStore,
        };
        for (let assertion of assertions) {
            let method = assertion[0];
            let prop = assertion[1];
            let value = _.get(assertionObject, prop);
            let args = assertion.slice(2);

            try {
                assert[method](value, ...args, prop);
            } catch (error) {
                return callback(error);
            }
        }
        return callback();
    },
    deepEqual(objectOne, objectTwo, callback) {
        try {
            assert.deepEqual(objectOne, objectTwo);
        } catch (error) {
            return callback(error);
        }
        return callback();
    },
};
