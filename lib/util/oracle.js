'use strict';

const assert = require('chai').assert;
const _ = require('lodash');

module.exports = {
    runAssertions(state, assertions, callback) {
        for (const assertion of assertions) {
            const method = assertion[0];
            const prop = assertion[1];
            const value = _.get(state, prop);
            const args = assertion.slice(2);

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
