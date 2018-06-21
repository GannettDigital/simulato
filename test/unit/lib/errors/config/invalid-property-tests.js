'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/config/invalid-property.js', function() {
  let ConfigError;
  let invalidProperty;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/config/invalid-property.js');

    ConfigError = sinon.stub();

    mockery.registerMock('./config-error.js', ConfigError);

    invalidProperty = require('../../../../../lib/errors/config/invalid-property.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ConfigError with \'INVALID_PROPERTY\', and passed in message', function() {
      invalidProperty('ERROR_MESSAGE');

      expect(ConfigError.args).to.deep.equal([
        ['INVALID_PROPERTY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ConfigError', function() {
      let result;

      result = invalidProperty('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ConfigError);
    });
  });
});
