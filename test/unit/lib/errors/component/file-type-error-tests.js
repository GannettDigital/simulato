'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/file-type-error.js', function() {
  let ComponentError;
  let fileTypeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/file-type-error.js');

    ComponentError = sinon.stub();

    mockery.registerMock('./component-error.js', ComponentError);

    fileTypeError = require('../../../../../lib/errors/component/file-type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ComponentError with \'FILE_TYPE_ERROR\', and passed in message', function() {
      fileTypeError('ERROR_MESSAGE');

      expect(ComponentError.args).to.deep.equal([
        ['FILE_TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ComponentError', function() {
      let result;

      result = fileTypeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ComponentError);
    });
  });
});
