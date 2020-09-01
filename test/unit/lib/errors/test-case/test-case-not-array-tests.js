'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/test-case/test-case-not-array.js', function() {
  let TestcaseError;
  let testCaseNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/test-case/test-case-not-array.js');

    TestcaseError = sinon.stub();

    mockery.registerMock('./test-case-error.js', TestcaseError);

    testCaseNotObject = require('../../../../../lib/errors/test-case/test-case-not-array.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new TestcaseError with \'TEST_CASE_NOT_ARRAY\', and passed in message', function() {
      testCaseNotObject('ERROR_MESSAGE');

      expect(TestcaseError.args).to.deep.equal([
        ['TEST_CASE_NOT_ARRAY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new TestcaseError', function() {
      const result = testCaseNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(TestcaseError);
    });
  });
});
