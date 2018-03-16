'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/test-case/index.js', function() {
  let FILE_TYPE_ERROR;
  let TEST_CASE_NOT_ARRAY;
  let TEST_CASE_TYPE_ERROR;
  let NO_TEST_CASES_FOUND;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/test-case');

    FILE_TYPE_ERROR = sinon.stub();
    TEST_CASE_NOT_ARRAY = sinon.stub();
    TEST_CASE_TYPE_ERROR = sinon.stub();
    NO_TEST_CASES_FOUND = sinon.stub();

    mockery.registerMock('./file-type-error.js', FILE_TYPE_ERROR);
    mockery.registerMock('./test-case-not-array.js', TEST_CASE_NOT_ARRAY);
    mockery.registerMock('./test-case-type-error.js', TEST_CASE_TYPE_ERROR);
    mockery.registerMock('./no-test-cases-found.js', NO_TEST_CASES_FOUND);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 4 items on an object', function() {
    let result = require('../../../../../lib/errors/test-case');

    expect(Object.getOwnPropertyNames(result).length).to.equal(4);
  });

  it('should have the property \'FILE_TYPE_ERROR\' with the value from requiring'
    + ' \'./file-type-error.js\'', function() {
    let result = require('../../../../../lib/errors/test-case');

    expect(result.FILE_TYPE_ERROR).to.deep.equal(FILE_TYPE_ERROR);
  });

  it('should have the property \'TEST_CASE_NOT_ARRAY\' with the value from requiring'
    + ' \'./test-case-not-array.js\'', function() {
    let result = require('../../../../../lib/errors/test-case');

    expect(result.TEST_CASE_NOT_ARRAY).to.deep.equal(TEST_CASE_NOT_ARRAY);
  });

  it('should have the property \'TEST_CASE_TYPE_ERROR\' with the value from requiring'
    + ' \'./test-case-type-error.js\'', function() {
    let result = require('../../../../../lib/errors/test-case');

    expect(result.TEST_CASE_TYPE_ERROR).to.deep.equal(TEST_CASE_TYPE_ERROR);
  });

  it('should have the property \'NO_TEST_CASES_FOUND\' with the value from requiring'
  + ' \'./no-test-cases-found.js\'', function() {
  let result = require('../../../../../lib/errors/test-case');

  expect(result.NO_TEST_CASES_FOUND).to.deep.equal(NO_TEST_CASES_FOUND);
});
});
