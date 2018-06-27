'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/config/invalid-value.js', function() {
  let ConfigError;
  let invalidValue;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/config/invalid-value.js');

    ConfigError = sinon.stub();

    mockery.registerMock('./config-error.js', ConfigError);

    invalidValue = require('../../../../../lib/errors/config/invalid-value.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ConfigError with \'INVALID_VALUE\', and passed in message', function() {
      invalidValue('ERROR_MESSAGE');

      expect(ConfigError.args).to.deep.equal([
        ['INVALID_VALUE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ConfigError', function() {
      let result;

      result = invalidValue('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ConfigError);
    });
  });
});
