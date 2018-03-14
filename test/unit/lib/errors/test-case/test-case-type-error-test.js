'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/test-case/test-case-type-error.js', function() {
  let TestcaseError;
  let testCaseTypeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/test-case/test-case-type-error.js');

    TestcaseError = sinon.stub();

    mockery.registerMock('./test-case-error.js', TestcaseError);

    testCaseTypeError = require('../../../../../lib/errors/test-case/test-case-type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new TestcaseError with \'TEST_CASE_TYPE_ERROR\', and passed in message', function() {
      testCaseTypeError('ERROR_MESSAGE');

      expect(TestcaseError.args).to.deep.equal([
        ['TEST_CASE_TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new TestcaseError', function() {
      let result;

      result = testCaseTypeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(TestcaseError);
    });
  });
});
