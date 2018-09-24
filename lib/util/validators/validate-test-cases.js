'use strict';

let path = require('path');

module.exports = function(files, callback) {
  let testCase;

  files = files.filter(function(file) {
    return (path.extname(file) === '.json' && file.split('-').pop() !== 'report.json');
  });

  for (let file of files) {
    try {
      testCase = require(file);
    } catch (error) {
      error.message = `The test case at path '${file}' was unable to be loaded for reason '${error.message}'`;
      throw error;
    }
    if (!Array.isArray(testCase)) {
      throw new SimulatoError.TEST_CASE.TEST_CASE_NOT_ARRAY(
          `The test case at path '${file}' must be an Array`
      );
    }
    for (let [index, action] of testCase.entries()) {
      if (typeof action !== 'object' || Array.isArray(action)) {
        throw new SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR(
            `The test case at file path '${file}' array index '${index}' must be an object`
        );
      }
      if (typeof action.name !== 'string') {
        throw new SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR(
            `The test case at file path '${file}' array index '${index}' name value must be a string`
        );
      }
      if (index === 0) {
        if (typeof action.type !== 'string') {
          throw new SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR(
              `The test case at file path '${file}' action '${action.name}' must have a type thats a string`
          );
        }
        if (typeof action.state !== 'object' || Array.isArray(action.state)) {
          throw new SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR(
              `The test case at file path '${file}' action '${action.name}' must have a state thats an object`
          );
        }
      }
    }
  };
  callback(files);
};
