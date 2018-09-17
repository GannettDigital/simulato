'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-model.js', function() {
  describe('on file being required', function() {
    let validateModel;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-model.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of validateModel to a new EventEmitter', function() {
      validateModel = require('../../../../../lib/util/validators/validate-model.js');

      expect(Object.getPrototypeOf(validateModel)).to.deep.equal(EventEmitterInstance);
    });

    it('should call validateModel.on with validateModel.objectReadyToValidate'
      + 'and validateModel._validateModelObject', function() {
      validateModel = require('../../../../../lib/util/validators/validate-model.js');

      expect(validateModel.on.args[0]).to.deep.equal([
        'validateModel.objectReadyToValidate',
        validateModel._validateModelObject,
      ]);
    });

    it('should call validateModel.on with validateModel.valueReadyToBeChecked'
      + 'and validateModel._handleValueTypes', function() {
      validateModel = require('../../../../../lib/util/validators/validate-model.js');

      expect(validateModel.on.args[1]).to.deep.equal([
        'validateModel.valueReadyToBeChecked',
        validateModel._handleValueTypes,
      ]);
    });

    it('should call validateModel.on 2 times', function() {
      validateModel = require('../../../../../lib/util/validators/validate-model.js');

      expect(validateModel.on.callCount).to.equal(2);
    });
  });

  describe('validate', function() {
    let instanceName;
    let componentName;
    let validateModel;
    let SimulatoError;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-model.js');

      instanceName = 'instanceName';
      componentName = 'componentName';

      SimulatoError = {
        MODEL: {
          MODEL_NOT_OBJECT: sinon.stub(),
        },
      };
      global.SimulatoError = SimulatoError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateModel = require('../../../../../lib/util/validators/validate-model.js');
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should throw an error if the passed in model is not an object', function() {
      SimulatoError.MODEL.MODEL_NOT_OBJECT.throws(
          {message: `Model for ${instanceName} were not returned as an Object by parent component ${componentName}`}
      );

      expect(validateModel.validate.bind(null, [], instanceName, componentName)).to.throw(
          `Model for ${instanceName} were not returned as an Object by parent component ${componentName}`
      );
    });

    it('should call validateModel.emit once with the event \'validateModel.objectReadyToValidate\''
      + 'with passed in model, componentName, and emptry string', function() {
      validateModel.validate({}, instanceName, componentName);

      expect(validateModel.emit.args).to.deep.equal([
        ['validateModel.objectReadyToValidate', {}, 'componentName', ''],
      ]);
    });
  });

  describe('_validateModelObject', function() {
    let componentName;
    let validateModel;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-model.js');

      componentName = 'componentName';

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateModel = require('../../../../../lib/util/validators/validate-model.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each key in the object passed in', function() {
      describe('if the object has the property key', function() {
        it('should call validateModel.emit once with the event \'validateModel.valueReady\''
          + 'value, parentKeyString, key, and componentName', function() {
          validateModel._validateModelObject({key: 'value'}, componentName, '');

          expect(validateModel.emit.args).to.deep.equal([
            ['validateModel.valueReady', 'value', '', 'key', 'componentName'],
          ]);
        });
      });
      describe('if the object does not have the property key', function() {
        it('should not call validateModel.emit', function() {
          let object = {
            key: 'value',
            hasOwnProperty: sinon.stub().returns(false),
          };

          validateModel._validateModelObject(object, componentName, '');

          expect(validateModel.emit.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_handleValueTypes', function() {
    let componentName;
    let validateModel;
    let SimulatoError;
    let parentKeyString;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-model.js');

      componentName = 'componentName';
      parentKeyString = 'parentKeyString.';

      SimulatoError = {
        MODEL: {
          MODEL_OBJECT_VALUE: sinon.stub(),
        },
      };
      global.SimulatoError = SimulatoError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateModel = require('../../../../../lib/util/validators/validate-model.js');
      validateModel.checkValueType = sinon.stub();
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the value is an object', function() {
      it('should call validateModel.emit once with the event \'validateModel.objectReadyToValidate\''
        + 'value, componentName, and parentKeyString', function() {
        validateModel._handleValueTypes({key2: 'value'}, parentKeyString, 'key1', componentName);

        expect(validateModel.emit.args).to.deep.equal([
          ['validateModel.objectReadyToValidate', {key2: 'value'}, 'componentName', 'parentKeyString.key1.'],
        ]);
      });
    });

    describe('if the value is NOT a string or function', function() {
      it('should throw an error', function() {
        let value = [];

        SimulatoError.MODEL.MODEL_OBJECT_VALUE.throws(
            {message: `Value for ${parentKeyString}1 inside ${componentName}`
            + ` model must be either a string or object`}
        );

        expect(validateModel._handleValueTypes.bind(null, value, parentKeyString, 'key1', componentName)).to.throw(
            `Value for parentKeyString.1 inside componentName model must be either a string or object`
        );
      });
    });

    describe('if the value is a string or function', function() {
      it('should not throw an error when value is a string', function() {
        SimulatoError.MODEL.MODEL_OBJECT_VALUE.throws(
            {message: `Value for ${parentKeyString}1 inside ${componentName}`
            + ` model must be either a string or object`}
        );

        expect(validateModel._handleValueTypes.bind(
            null, 'value', parentKeyString, 'key1', componentName
        )).to.not.throw();
      });
      it('should not throw an error when value is a function', function() {
        SimulatoError.MODEL.MODEL_OBJECT_VALUE.throws(
            {message: `Value for ${parentKeyString}1 inside ${componentName}`
            + ` model must be either a string or object`}
        );

        expect(validateModel._handleValueTypes.bind(
            null, sinon.stub(), parentKeyString, 'key1', componentName
        )).to.not.throw();
      });
      it('should not call validateModel.emit', function() {
        validateModel._handleValueTypes('value', parentKeyString, 'key1', componentName);

        expect(validateModel.emit.callCount).to.equal(0);
      });
    });
  });
});
