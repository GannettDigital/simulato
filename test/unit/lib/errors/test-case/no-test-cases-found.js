'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/test-case/no-test-cases-found.js', function() {
  let TestcaseError;
  let noTestcasesFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/test-case/no-test-cases-found.js');

    TestcaseError = sinon.stub();

    mockery.registerMock('./test-case-error.js', TestcaseError);

    noTestcasesFound = require('../../../../../lib/errors/test-case/no-test-cases-found.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new TestcaseError with \'NO_TEST_CASES_FOUND\', and passed in message', function() {
      noTestcasesFound('ERROR_MESSAGE');

      expect(TestcaseError.args).to.deep.equal([
        ['NO_TEST_CASES_FOUND', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new TestcaseError', function() {
      let result;

      result = noTestcasesFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(TestcaseError);
    });
  });
});
