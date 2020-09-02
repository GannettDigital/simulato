'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/config/type-error.js', function() {
  let ConfigError;
  let typeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/config/type-error.js');

    ConfigError = sinon.stub();

    mockery.registerMock('./config-error.js', ConfigError);

    typeError = require('../../../../../lib/errors/config/type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ConfigError with \'TYPE_ERROR\', and passed in message', function() {
      typeError('ERROR_MESSAGE');

      expect(ConfigError.args).to.deep.equal([
        ['TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ConfigError', function() {
      const result = typeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ConfigError);
    });
  });
});
