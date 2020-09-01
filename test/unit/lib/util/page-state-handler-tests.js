'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/page-state-handler.js', function() {
  describe('getPageState', function() {
    let pageStateHandler;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      callback = sinon.spy();

      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      pageStateHandler._getComponentsStates = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in components has a size of 0', function() {
      it('should call the callback with null and an empty object', function() {
        pageStateHandler.getPageState(new Map(), callback);

        expect(callback.args).to.deep.equal([
          [null, {}],
        ]);
      });
    });

    it('should call pageStateHanlder._getComponentsStates with the component, and the passed in callback', function() {
      const components = new Map();
      components.set('key1', 'component1');
      components.set('key2', 'component2');

      pageStateHandler.getPageState(components, callback);

      expect(pageStateHandler._getComponentsStates.args).to.deep.equal([
        [new Map([['key1', 'component1'], ['key2', 'component2']]), callback],
      ]);
    });
  });

  describe('_getComponentsStates', function() {
    let pageStateHandler;
    let getElementData;
    let callback;
    let components;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      getElementData = sinon.stub();
      global.driver = {
        executeAsyncScript: sinon.stub(),
        then: sinon.stub(),
      };
      driver.executeAsyncScript.returns(driver);

      callback = sinon.stub();

      components = new Map();
      components.set('component1', {
        type: 'Component',
        name: 'component1',
        elements: ['someElement1', 'someElement2'],
        model: {someModel: 'ofThisComponent'},
      });
      components.set('component2', {
        type: 'Component',
        name: 'component2',
        elements: ['someElement3', 'someElement4'],
        model: {someModel: 'ofThisComponent'},
      });

      sinon.spy(components, 'values');

      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', getElementData);

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      pageStateHandler._aggregatePageState = sinon.stub();
    });

    afterEach(function() {
      components.values.restore();
      delete global.driver;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call components.values once with no arguments', function() {
      pageStateHandler._getComponentsStates(components, callback);

      expect(components.values.args).to.deep.equal([[]]);
    });

    it('should call driver.executeAsyncScript with getElementData and the passed in components', function() {
      const componenetElements = {
        component1: ['someElement1', 'someElement2'],
        component2: ['someElement3', 'someElement4'],
      };

      pageStateHandler._getComponentsStates(components, callback);

      expect(driver.executeAsyncScript.args).to.deep.equal([
        [getElementData, componenetElements],
      ]);
    });

    describe(`when driver.executeAsyncScript's promise is resolved`, function() {
      it(`should call pageStateHandler.emit with the event 'pageStateHandler.componentDataReceived' ` +
      `the component.model, the component, the returned data, and the passed in pageStateData`, function() {
        driver.then.callsArgWith(0, {component1: 'someData', component2: 'someMoreData'});

        pageStateHandler._getComponentsStates(components, callback);

        expect(pageStateHandler._aggregatePageState.args).to.deep.equal([
          [
            components,
            {component1: 'someData', component2: 'someMoreData'},
            callback,
          ],
        ]);
      });
    });
  });

  describe('_aggregatePageState', function() {
    let pageStateHandler;
    let components;
    let componentsData;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      componentsData = {
        component1: {data: 'someData'},
        component2: {data: 'someMoreData'},
      };
      components = new Map();
      components.set('component1', {
        type: 'Component',
        name: 'component1',
        elements: ['someElement1', 'someElement2'],
        model: {someModel: 'ofThisComponent'},
      });
      components.set('component2', {
        type: 'Component',
        name: 'component2',
        elements: ['someElement3', 'someElement4'],
        model: {someModel: 'ofThisComponent2'},
      });
      callback = sinon.stub();
      sinon.spy(components, 'values');

      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      pageStateHandler._createComponentModel = sinon.stub();
    });

    afterEach(function() {
      components.values.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it(`should call components.values once with no arguments`, function() {
      pageStateHandler._aggregatePageState(components, componentsData, callback);

      expect(components.values.args).to.deep.equal([[]]);
    });

    describe('when there are two components', function() {
      it(`should call pageStateHandler._createComponentModel twice with the component's model and data`, function() {
        pageStateHandler._aggregatePageState(components, componentsData, callback);

        expect(pageStateHandler._createComponentModel.args).to.deep.equal([
          [
            {someModel: 'ofThisComponent'},
            {data: 'someData'},
          ],
          [
            {someModel: 'ofThisComponent2'},
            {data: 'someMoreData'},
          ],
        ]);
      });
    });

    it(`should call the callback function with null and the pageModel`, function() {
      pageStateHandler._createComponentModel.onCall(0).returns('modelOfComponent1');
      pageStateHandler._createComponentModel.onCall(1).returns('modelOfComponent2');

      pageStateHandler._aggregatePageState(components, componentsData, callback);

      expect(callback.args).to.deep.equal([
        [
          null,
          {
            component1: 'modelOfComponent1',
            component2: 'modelOfComponent2',
          },
        ],
      ]);
    });
  });

  describe('_createComponentModel', function() {
    let pageStateHandler;
    let data;
    let _;
    let modelTemplate;
    let expectedReturnData;
    let createComponentModel;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      data = {
        data: 'someData',
      };
      modelTemplate = {
        prop1: sinon.stub().returns('dataFromFunction'),
        prop2: 'string',
        prop3: {
          data: 'propData',
        },
      };
      _ = {
        get: sinon.stub().returns('string'),
      };
      expectedReturnData = {
        prop1: 'dataFromFunction',
        prop2: 'string',
        prop3: undefined,
      };

      mockery.registerMock('lodash', _);
      mockery.registerMock('./get-element-data.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      createComponentModel = pageStateHandler._createComponentModel;
      pageStateHandler._createComponentModel = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each propertyName in the properties of the passed in modelTemplate', function() {
      describe('if the type of that propertyName\'s value is a function', function() {
        it('should call that function passing in the passed in data', function() {
          createComponentModel(modelTemplate, data);

          expect(modelTemplate.prop1.args).to.deep.equal([[data]]);
        });

        it('should set the returned functions value to the model under the property\'s name', function() {
          const result = createComponentModel(modelTemplate, data);

          expect(result).to.deep.equal(expectedReturnData);
        });

        describe('if the function throws an error', function() {
          it('should set the returned functions value to undefined', function() {
            modelTemplate.prop1.throws(new Error('error'));
            expectedReturnData.prop1 = undefined;

            const result = createComponentModel(modelTemplate, data);

            expect(result).to.deep.equal(expectedReturnData);
          });
        });
      });

      describe('if the type of that propertyName\'s value is a string', function() {
        it('should call _.get once with the passed in data and that properties value', function() {
          createComponentModel(modelTemplate, data);

          expect(_.get.args).to.deep.equal([[data, 'string']]);
        });
      });

      describe('if the type of that propertyName\'s value is a object', function() {
        it(`should call pageStateHandler._createComponentModel once with the property and data`, function() {
          createComponentModel(modelTemplate, data);

          expect(pageStateHandler._createComponentModel.args).to.deep.equal([
            [
              {data: 'propData'},
              {data: 'someData'},
            ],
          ]);
        });
      });
    });
  });
});
