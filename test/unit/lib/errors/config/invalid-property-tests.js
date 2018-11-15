'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/config/required-property.js', function() {
  let ConfigError;
  let requiredProperty;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/config/required-property.js');

    ConfigError = sinon.stub();

    mockery.registerMock('./config-error.js', ConfigError);

    requiredProperty = require('../../../../../lib/errors/config/required-property.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ConfigError with \'REQUIRED_PROPERTY\', and passed in message', function() {
      requiredProperty('ERROR_MESSAGE');

      expect(ConfigError.args).to.deep.equal([
        ['REQUIRED_PROPERTY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ConfigError', function() {
      let result;

      result = requiredProperty('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ConfigError);
    });
  });
});
