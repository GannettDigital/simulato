'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/test-case/file-type-error.js', function() {
  let testCaseError;
  let fileTypeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/test-case/file-type-error.js');

    testCaseError = sinon.stub();

    mockery.registerMock('./test-case-error.js', testCaseError);

    fileTypeError = require('../../../../../lib/errors/test-case/file-type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new testCaseError with \'FILE_TYPE_ERROR\', and passed in message', function() {
      fileTypeError('ERROR_MESSAGE');

      expect(testCaseError.args).to.deep.equal([
        ['FILE_TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new testCaseError', function() {
      const result = fileTypeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(testCaseError);
    });
  });
});
