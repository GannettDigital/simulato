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
    let Ajv;
    let ajv;
    let configSchema;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-config.js');

      callback = sinon.stub();
      config = {
        configKey: 'configValue',
      };
      configOptions = {
        configOptionsKey: 'configOptionsValue',
      };
      cliOptions = {
        cliOptionsKey: 'cliOptionsKey',
      };
      Ajv = sinon.stub();
      ajv = {
        validate: sinon.stub(),
      };
      Ajv.returns(ajv);
      configSchema = {schema: 'schemaValue'};
      global.SimulatoError = {
        CONFIG: {
          REQUIRED_PROPERTY: sinon.stub(),
          TYPE_ERROR: sinon.stub(),
          INVALID_VALUE: sinon.stub(),
        },
      };

      mockery.registerMock('ajv', Ajv);
      mockery.registerMock('../config/schema.js', configSchema);
      validateConfig = require('../../../../../lib/util/validators/validate-config.js');
      validateConfig._getOrigin = sinon.stub().returns('origin');
      validateConfig._validateType = sinon.stub();
      validateConfig._validateReporter = sinon.stub();
      validateConfig._validateWriter = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call ajv.validate once with the required in schema, and passed in config', function() {
      ajv.validate.returns(true);

      validateConfig.validate(config, configOptions, cliOptions, callback);

      expect(ajv.validate.args).to.deep.equal([[
        {schema: 'schemaValue'},
        {configKey: 'configValue'},
      ]]);
    });

    describe('if the call to ajv.validate is returned falsey', function() {
      describe('if the returned error has the keyword \'required\'', function() {
        describe('if the error has a dataPath', function() {
          it('should create the error with which key is required modified with dataPath', function() {
            ajv.errors = [{
              keyword: 'required',
              dataPath: './subPath',
              params: {
                missingProperty: 'missingKey',
              },
            }];

            try {
              validateConfig.validate(config, configOptions, cliOptions, callback);
            } catch (error) {
            }

            expect(global.SimulatoError.CONFIG.REQUIRED_PROPERTY.args).to.deep.equal([
              ['Property \'/subPath.missingKey\' required'],
            ]);
          });
        });

        describe('if the error has a dataPath that is fasley', function() {
          it('should create the error with which key is required modified with dataPath', function() {
            ajv.errors = [{
              keyword: 'required',
              dataPath: '',
              params: {
                missingProperty: 'missingKey',
              },
            }];

            try {
              validateConfig.validate(config, configOptions, cliOptions, callback);
            } catch (error) {
            }

            expect(global.SimulatoError.CONFIG.REQUIRED_PROPERTY.args).to.deep.equal([
              ['Property \'missingKey\' required'],
            ]);
          });
        });

        it('should throw a CONFIG.REQUIRED_PROPERTY error', function() {
          ajv.errors = [{
            keyword: 'required',
            dataPath: './subPath',
            params: {
              missingProperty: 'missingKey',
            },
          }];
          global.SimulatoError.CONFIG.REQUIRED_PROPERTY.returns(
              {message: 'My Error'}
          );

          expect(validateConfig.validate.bind(null, config, configOptions, cliOptions, callback))
              .to.throw('My Error');
        });
      });

      describe('if the returned error has the keyword \'type\' and not \'required\'', function() {
        it('should call validateConifg._getOrigin once with the key, the configOptions, and cliOptions', function() {
          ajv.errors = [{
            keyword: 'type',
            dataPath: '.badKey',
            params: {
              type: 'string',
            },
          }];
          config = {
            badKey: 1,
          };

          try {
            validateConfig.validate(config, configOptions, cliOptions, callback);
          } catch (error) {
          }

          expect(validateConfig._getOrigin.args).to.deep.equal([
            ['badKey', {configOptionsKey: 'configOptionsValue'}, {cliOptionsKey: 'cliOptionsKey'}],
          ]);
        });

        it('should create the error with the type of value for the key, the key, ' +
            'the origin, and what the valid type is', function() {
          ajv.errors = [{
            keyword: 'type',
            dataPath: '.badKey',
            params: {
              type: 'string',
            },
          }];
          config = {
            badKey: 1,
          };

          try {
            validateConfig.validate(config, configOptions, cliOptions, callback);
          } catch (error) {
          }

          expect(global.SimulatoError.CONFIG.TYPE_ERROR.args).to.deep.equal([
            ['Invalid Type: \'number\' for Property: \'badKey\' Origin: \'origin\' Valid Type: \'string\''],
          ]);
        });

        it('should throw a CONFIG.TYPE_ERROR error', function() {
          ajv.errors = [{
            keyword: 'type',
            dataPath: '.badKey',
            params: {
              type: 'string',
            },
          }];
          global.SimulatoError.CONFIG.TYPE_ERROR.returns(
              {message: 'My type Error'}
          );

          expect(validateConfig.validate.bind(null, config, configOptions, cliOptions, callback))
              .to.throw('My type Error');
        });
      });

      describe('if the returned error has the keyword \'enum\' and not \'required\' or \'type\'', function() {
        it('should call validateConifg._getOrigin once with the key, the configOptions, and cliOptions', function() {
          ajv.errors = [{
            keyword: 'enum',
            dataPath: '.badKey',
            params: {
              allowedValues: ['validValue1', 'validValue2'],
            },
          }];
          config = {
            badKey: 'invalidValue',
          };

          try {
            validateConfig.validate(config, configOptions, cliOptions, callback);
          } catch (error) {
          }

          expect(validateConfig._getOrigin.args).to.deep.equal([
            ['badKey', {configOptionsKey: 'configOptionsValue'}, {cliOptionsKey: 'cliOptionsKey'}],
          ]);
        });

        it('should create the error with the invalud value, the key, ' +
            'the origin, and what the valid values are', function() {
          ajv.errors = [{
            keyword: 'enum',
            dataPath: '.badKey',
            params: {
              allowedValues: ['validValue1', 'validValue2'],
            },
          }];
          config = {
            badKey: 'invalidValue',
          };

          try {
            validateConfig.validate(config, configOptions, cliOptions, callback);
          } catch (error) {
          }

          expect(global.SimulatoError.CONFIG.INVALID_VALUE.args).to.deep.equal([
            [
              'Invalid Value: \'invalidValue\' for Property: \'badKey\' Origin: \'origin\'' +
                ' Valid Values: \'validValue1,validValue2\'',
            ],
          ]);
        });

        it('should throw a CONFIG.INVALID_VALUE error', function() {
          ajv.errors = [{
            keyword: 'enum',
            dataPath: '.badKey',
            params: {
              allowedValues: ['validValue1', 'validValue2'],
            },
          }];
          global.SimulatoError.CONFIG.INVALID_VALUE.returns(
              {message: 'My type Error'}
          );

          expect(validateConfig.validate.bind(null, config, configOptions, cliOptions, callback))
              .to.throw('My type Error');
        });
      });

      describe('if the returned error does not have the keyword \'required\', \'type\', or \'enum\'', function() {
        it('should create the error with the error.message', function() {
          ajv.errors = [{
            keyword: 'other',
            message: 'some error message',
          }];

          try {
            validateConfig.validate(config, configOptions, cliOptions, callback);
          } catch (error) {
          }

          expect(global.SimulatoError.CONFIG.TYPE_ERROR.args).to.deep.equal([
            [
              'Error validating schema. Message: \'some error message\'',
            ],
          ]);
        });

        it('should throw a CONFIG.TYPE_ERROR error', function() {
          ajv.errors = [{
            keyword: 'other',
            message: 'some error message',
          }];
          global.SimulatoError.CONFIG.TYPE_ERROR.returns(
              {message: 'My other type Error'}
          );

          expect(validateConfig.validate.bind(null, config, configOptions, cliOptions, callback))
              .to.throw('My other type Error');
        });
      });
    });

    it('should call the passed in callback once with no params', function() {
      ajv.validate.returns(true);

      validateConfig.validate(config, configOptions, cliOptions, callback);

      expect(callback.args).to.deep.equal([[]]);
    });
  });

  describe('_getOrigin', function() {
    let validateConfig;
    let result;
    let Ajv;
    let ajv;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-config.js');

      Ajv = sinon.stub();
      ajv = {};
      Ajv.returns(ajv);

      mockery.registerMock('ajv', Ajv);
      mockery.registerMock('../config/schema.js', {});

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
});
