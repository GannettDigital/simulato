'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-elements.js', function() {
  describe('on file being required', function() {
    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-elements.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should export a function', function() {
        let result = require('../../../../../lib/util/validators/validate-elements.js');

        expect(result).to.be.a('function');
    });
  });
  describe('on exported function being executed', function() {
    let instanceName;
    let componentName;
    let validateElements;
    let MbttError;
    let elementsNotArrayError;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-elements.js');

      instanceName = 'instanceName';
      componentName = 'componentName';

      elementsNotArrayError = {
        message: `Elements for ${instanceName} were not returned as an Array by parent component ${componentName}`,
      };

      MbttError = {
        ELEMENT: {
          ELEMENTS_NOT_ARRAY: sinon.stub().throws(elementsNotArrayError),
          ELEMENT_NOT_OBJECT: sinon.stub(),
          ELEMENT_OBJECT_PROPERTY_TYPE: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      validateElements = require('../../../../../lib/util/validators/validate-elements.js');
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should throw an error if the passed in elements is not an array', function() {
      expect(validateElements.bind(null, {key: 'value'}, instanceName, componentName)).to.throw(
        'Elements for instanceName were not returned as an Array by parent component componentName'
      );
    });

    describe('for each value of the passed in elements', function() {
      it('should throw an error if the value is not an object', function() {
        MbttError.ELEMENT.ELEMENT_NOT_OBJECT.throws(
          {message: `Element of elements array at index ${0} for component ${componentName} must be an object`}
        );

        expect(validateElements.bind(null, ['element1'], instanceName, componentName)).to.throw(
          'Element of elements array at index 0 for component componentName must be an object'
        );
      });

      it('should throw an error if the value.name is not a string', function() {
        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `Element of elements array at index ${0} for component ${componentName} must be an string`}
        );

        expect(validateElements.bind(null, [{name: 1}], instanceName, componentName)).to.throw(
          'Element of elements array at index 0 for component componentName must be an string'
        );
      });

      it('should throw an error if the selector field is not an object', function() {
        let elements = [{name: 'name', selector: []}];

        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `The selector field for ${elements[0].name} must be an object`}
        );

        expect(validateElements.bind(null, elements, instanceName, componentName)).to.throw(
          `The selector field for name must be an object`
        );
      });

      it('should throw an error if value.selector.type is not a string', function() {
        let elements = [{name: 'name', selector: {type: 1}}];

        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `The selector 'type' field for ${elements[0].name} must be a string`}
        );

        expect(validateElements.bind(null, elements, instanceName, componentName)).to.throw(
          `The selector 'type' field for name must be a string`
        );
      });

      it('should throw an error if value.selector.type is not \'attribute\' or \'querySelector\'', function() {
        let elements = [{name: 'name', selector: {type: 'madeUpType'}}];

        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `The selector 'type' field for ${elements[0].name} must be either 'attribute' or 'querySelector`}
        );

        expect(validateElements.bind(null, elements, instanceName, componentName)).to.throw(
          `The selector 'type' field for name must be either 'attribute' or 'querySelector`
        );
      });

      describe('if the value.selector.type field is \'attribute\'', function() {
        it('should throw an error if value.selector.key is not a string', function() {
          let elements = [{name: 'name', selector: {type: 'attribute', key: 1}}];

          MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
            {message: `The selector 'key' field for ${elements[0].name}`
              + ` must be a string when using selector type attribute`}
          );

          expect(validateElements.bind(null, elements, instanceName, componentName)).to.throw(
            `The selector 'key' field for name must be a string when using selector type attribute`
          );
        });
      });

      it('should throw an error if the value.selector.value is not a string', function() {
        let elements = [{name: 'name', selector: {type: 'attribute', key: 'key', value: 1}}];

        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `The selector 'value' field for ${elements[0].name} must be a string`}
        );

        expect(validateElements.bind(null, elements, instanceName, componentName)).to.throw(
          `The selector 'value' field for name must be a string`
        );
      });
      it('should throw no error if value.selector.value is a string', function() {
        let elements = [{name: 'name', selector: {type: 'attribute', key: 'key', value: 'value'}}];

        MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE.throws(
          {message: `The selector 'value' field for ${elements[0].name} must be a string`}
        );

        expect(validateElements.bind(null, elements, instanceName, componentName)).to.not.throw();
      });
    });
  });
});
