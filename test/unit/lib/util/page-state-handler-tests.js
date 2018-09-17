'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/page-state-handler.js', function() {
  describe('on file being required', function() {
    let pageStateHandler;
    let Emitter;
    let globalEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('./emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});
      mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', globalEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn with pageStateHandler and globalEventDispatch', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          pageStateHandler,
          globalEventDispatch,
        ],
      ]);
    });

    it('should call pageStateHandler.on 3 times', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(pageStateHandler.on.callCount).to.equal(3);
    });

    it('should call pageStateHandler.on with the event \'pageStateHandler.componentRetrieved\' and the '
      + 'function pageStateHandler._getComponentState', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(pageStateHandler.on.args[0]).to.deep.equal([
        'pageStateHandler.componentRetrieved',
        pageStateHandler._getComponentState,
      ]);
    });

    it('should call pageStateHandler.on with the event \'pageStateHandler.componentDataReceived\' and the '
      + 'function pageStateHandler._aggregatePageState', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(pageStateHandler.on.args[1]).to.deep.equal([
        'pageStateHandler.componentDataReceived',
        pageStateHandler._aggregatePageState,
      ]);
    });

    it('should call pageStateHandler.on with the event \'pageStateHandler.createComponentModel\' and the '
      + 'function pageStateHandler._createComponentModel', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(pageStateHandler.on.args[2]).to.deep.equal([
        'pageStateHandler.createComponentModel',
        pageStateHandler._createComponentModel,
      ]);
    });
  });

  describe('getPageState', function() {
    let Emitter;
    let pageStateHandler;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      callback = sinon.spy();

      mockery.registerMock('./emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});
      mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');
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

    describe('for each component in the components map', function() {
      it('should call pageStateHanlder.emit with the event \'pageStateHandler.componentRetrieved\''
        + 'the component, and the pageStateData object', function() {
        let components = new Map();
        components.set('key1', 'component1');
        components.set('key2', 'component2');
        pageStateHandler.getPageState(components, callback);

        expect(pageStateHandler.emit.args).to.deep.equal([
          ['pageStateHandler.componentRetrieved', 'component1', {pageModel: {}, length: 2, callback}],
          ['pageStateHandler.componentRetrieved', 'component2', {pageModel: {}, length: 2, callback}],
        ]);
      });
    });
  });

  describe('_getComponentState', function() {
    let Emitter;
    let pageStateHandler;
    let getElementData;
    let component;
    let pageStateData;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      getElementData = sinon.stub();

      global.driver = {
        executeAsyncScript: sinon.stub(),
        then: sinon.stub(),
      };
      driver.executeAsyncScript.returns(driver);

      component = {
        type: 'Component',
        name: 'component1',
        elements: ['someElement1', 'someElement2'],
        model: {someModel: 'ofThisComponent'},
      };

      pageStateData = {
        state1: 'someData',
        state2: 'someOtherData',
      };

      mockery.registerMock('./emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', getElementData);
      mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');
    });

    afterEach(function() {
      delete global.driver;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call driver.executeAsyncScript with getElementData and the passed in component.elements', function() {
      pageStateHandler._getComponentState(component, pageStateData);

      expect(driver.executeAsyncScript.args).to.deep.equal([
        [getElementData, component.elements],
      ]);
    });

    describe(`when driver.executeAsyncScript's promise is resolved`, function() {
      it(`should call pageStateHandler.emit with the event 'pageStateHandler.componentDataReceived' `
      + `the component.model, the component, the returned data, and the passed in pageStateData`, function() {
        driver.then.callsArgWith(0, {data: 'someData'});

        pageStateHandler._getComponentState(component, pageStateData);

        expect(pageStateHandler.emit.args).to.deep.equal([
          [
            'pageStateHandler.componentDataReceived',
            component.model,
            component,
            {data: 'someData'},
            pageStateData,
          ],
        ]);
      });
    });
  });

  describe('_aggregatePageState', function() {
    let Emitter;
    let pageStateHandler;
    let model;
    let data;
    let component;
    let pageStateData;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      model = {
        someModel: 'ofSomething',
      };
      data = {
        data: 'someData',
      };
      component = {
        name: 'component1',
      };
      pageStateData = {
        pageModel: {},
        length: 1,
        callback: sinon.stub(),
      };

      mockery.registerMock('./emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});
      mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it(`should call pageStateHandler.emit once`, function() {
      pageStateHandler._aggregatePageState(model, component, data, pageStateData);

      expect(pageStateHandler.emit.callCount).to.equal(1);
    });

    it(`should call pageStateHandler.emit with the event 'pageStateHandler.createComponentModel' `
      + `the passed in model, data, as first 3 parameters`, function() {
      pageStateHandler._aggregatePageState(model, component, data, pageStateData);

      expect(pageStateHandler.emit.args[0].splice(0, 3)).to.deep.equal([
        'pageStateHandler.createComponentModel', model, data,
      ]);
    });

    it(`should call pageStateHandler.emit a callback function as the last parameter`, function() {
      pageStateHandler._aggregatePageState(model, component, data, pageStateData);

      expect(pageStateHandler.emit.args[0].splice(3, 1)[0]).to.be.a('function');
    });

    describe('when the events callback is called', function() {
      it('should set pageStateData.pageModel[component.name] to the returned model', function() {
        pageStateHandler.emit.callsArgWith(3, {model: 'someModel'});

        pageStateHandler._aggregatePageState(model, component, data, pageStateData);

        expect(pageStateData.pageModel[component.name]).to.deep.equal({model: 'someModel'});
      });
    });

    describe('when the number of keys in pageModel is equal to the number of components', function() {
      it('should call pageStateData.callback with null and the pageModel', function() {
        pageStateHandler.emit.callsArgWith(3, {model: 'someModel'});

        pageStateHandler._aggregatePageState(model, component, data, pageStateData);

        expect(pageStateData.callback.args).to.deep.equal([
          [null, {component1: {model: 'someModel'}}],
        ]);
      });
    });
  });

  describe('_createComponentModel', function() {
    let Emitter;
    let pageStateHandler;
    let data;
    let _;
    let callback;
    let modelTemplate;
    let expectedReturnData;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

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
      };
      callback = sinon.stub();

      mockery.registerMock('./emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./get-element-data.js', {});
      mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

      pageStateHandler = require('../../../../lib/util/page-state-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each propertyName in the properties of the passed in modelTemplate', function() {
      describe('if the type of that propertyName\'s value is a function', function() {
        it('should call that function passing in the passed in data', function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(modelTemplate.prop1.args).to.deep.equal([[data]]);
        });

        it('should set the returned functions value to the model under the property\'s name', function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(callback.args).to.deep.equal([[expectedReturnData]]);
        });

        describe('if the function throws an error', function() {
          it('should set the returned functions value to undefined', function() {
            modelTemplate.prop1.throws(new Error('error'));
            expectedReturnData.prop1 = undefined;

            pageStateHandler._createComponentModel(modelTemplate, data, callback);

            expect(callback.args).to.deep.equal([[expectedReturnData]]);
          });
        });
      });

      describe('if the type of that propertyName\'s value is a string', function() {
        it('should call _.get once with the passed in data and that properties value', function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(_.get.args).to.deep.equal([[data, 'string']]);
        });

        it('should set the returned functions value to the model under the property\'s name', function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(callback.args).to.deep.equal([[expectedReturnData]]);
        });
      });

      describe('if the type of that propertyName\'s value is a object', function() {
        it(`should call pageStateHandler.emit once`, function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(pageStateHandler.emit.callCount).to.equal(1);
        });

        it(`should call pageStateHandler.emit with the event 'pageStateHandler.createComponentModel' `
          + `the propertie\'s value, data, as first 3 parameters`, function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(pageStateHandler.emit.args[0].splice(0, 3)).to.deep.equal([
            'pageStateHandler.createComponentModel', {data: 'propData'}, data,
          ]);
        });

        it(`should call pageStateHandler.emit a callback function as the last parameter`, function() {
          pageStateHandler._createComponentModel(modelTemplate, data, callback);

          expect(pageStateHandler.emit.args[0].splice(3, 1)[0]).to.be.a('function');
        });

        describe('when the events callback is called', function() {
          it('should set the returned functions value to the model under the property\'s name', function() {
            pageStateHandler.emit.callsArgWith(3, 'propData');
            expectedReturnData.prop3 = 'propData';

            pageStateHandler._createComponentModel(modelTemplate, data, callback);

            expect(callback.args).to.deep.equal([[expectedReturnData]]);
          });
        });
      });
    });
  });
});
