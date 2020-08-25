'use strict';

const got = require('got');

module.exports = {
  configure(testFiles) {
    for (const testFile of testFiles) {
      const test = require(testFile);
      await got.post('localhost:3000/run', {
        json: test,
        responseType: 'json'
      });
    }
  },
};
