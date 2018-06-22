'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-config.js', function() {
  describe('validate', function() {
    let config;
    let configOptions;
    let cliOptions;
    let callback;
    let validateConfig;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-config.js');

      callback = sinon.stub();
      config = {
        configKey: 'configValue',
        hasOwnProperty: sinon.stub().returns(true),
      };
      configOptions = {
        configOptionsKey: 'configOptionsValue',
      };
      cliOptions = {
        cliOptionsKey: 'cliOptionsKey',
      };

      validateConfig = require('../../../../../lib/util/validators/validate-config.js');
      validateConfig._getOrigin = sinon.stub().returns('origin');
      validateConfig._validateType = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each key in the passed in config', function() {
      describe('if the passed in config has the property', function() {
        it('should call validateConfig._getOrigin once passing in the key, ' +
        'the passed in configOptions and cliOptions', function() {
          validateConfig.validate(config, configOptions, cliOptions, callback);

          expect(validateConfig._getOrigin.args).to.deep.equal([[
            'configKey',
            configOptions,
            cliOptions,
          ]]);
        });

        it('should call validateConfig._validateType once passing in the returned origin, ' +
        'the key and the configs[key] value', function() {
          validateConfig.validate(config, configOptions, cliOptions, callback);

          expect(validateConfig._validateType.args).to.deep.equal([[
            'origin',
            'configKey',
            'configValue',
          ]]);
        });

        it('should call the passed in callback once with no args', function() {
          validateConfig.validate(config, configOptions, cliOptions, callback);

          expect(callback.args).to.deep.equal([[]]);
        });
      });

      describe('if the passed in config does NOT have the property', function() {
        it('should NOT call the passed in callback', function() {
          config.hasOwnProperty.returns(false);

          validateConfig.validate(config, configOptions, cliOptions, callback);

          expect(callback.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_getOrigin', function() {
    let validateConfig;
    let result;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-config.js');

      validateConfig = require('../../../../../lib/util/validators/validate-config.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in cliOptions has the property of the passed in key', function() {
      it('should return the string \'cli\'', function() {
        result = validateConfig._getOrigin('key', {}, {key: 'value'});

        expect(result).to.equal('cli');
      });
    });

    describe('if the passed in cliOptions DOES NOT have the property of the passed in key', function() {
      describe('if the passed in configOptions has the property of the passed in key', function() {
        it('should return the string \'config\'', function() {
          result = validateConfig._getOrigin('key', {key: 'value'}, {});

          expect(result).to.equal('config');
        });
      });

      describe('if the passed in configOptions DOES NOT have the property of the passed in key', function() {
        it('should return the string \'default\'', function() {
          result = validateConfig._getOrigin('key', {}, {});

          expect(result).to.equal('default');
        });
      });
    });
  });

  describe('_validateType', function() {
    let validateConfig;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-config.js');

      global.SimulatoError = {
        CONFIG: {
          TYPE_ERROR: sinon.stub().throws({message: 'type error'}),
          INVALID_PROPERTY: sinon.stub().throws({message: 'invalid property'}),
        },
      };

      validateConfig = require('../../../../../lib/util/validators/validate-config.js');
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in key is included in _stringValues', function() {
      describe('if the passed in value is not a string', function() {
        it('should throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'testPath', 3)).to.throw('type error');
        });
      });

      describe('if the passed in value is a string', function() {
        it('should not throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'testPath', 'path')).to.not.throw();
        });
      });
    });

    describe('if the passed in key is included in _numberValues and not _stringValues', function() {
      describe('if the passed in value is not a number', function() {
        it('should throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'parallelism', 'string')).to.throw('type error');
        });
      });

      describe('if the passed in value is a number', function() {
        it('should not throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'parallelism', 2)).to.not.throw();
        });
      });
    });

    describe('if the passed in key is included in _booleanValues and not ' +
      '_stringValues or _numberValues', function() {
      describe('if the passed in value is not a boolean', function() {
        it('should throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'debug', 'string')).to.throw('type error');
        });
      });

      describe('if the passed in value is a number', function() {
        it('should not throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'debug', true)).to.not.throw();
        });
      });
    });

    describe('if the passed in key is included in _objectValues and not ' +
      '_stringValues, _numberValues or _booleanValues', function() {
      describe('if the passed in value is not an object', function() {
        it('should throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'sauceCapabilities', [])).to.throw('type error');
        });
      });

      describe('if the passed in value is an object', function() {
        it('should not throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'sauceCapabilities', {})).to.not.throw();
        });
      });
    });

    describe('if the passed in key NOT included in _objectValues, ' +
      '_stringValues, _numberValues or _booleanValues', function() {
        it('should throw an error', function() {
          expect(validateConfig._validateType.bind(null, 'origin', 'badProp', 2)).to.throw('invalid property');
        });
    });
  });
});
