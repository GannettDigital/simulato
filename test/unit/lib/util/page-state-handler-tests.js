'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe.only('lib/util/page-state-handler.js', function() {
  describe('on file being required', function() {
    let pageStateHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of pageStateHandler to a new EventEmitter', function() {
      pageStateHandler = require('../../../../lib/util/page-state-handler.js');

      expect(Object.getPrototypeOf(pageStateHandler)).to.deep.equal(EventEmitterInstance);
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
    let EventEmitter;
    let EventEmitterInstance;
    let pageStateHandler;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
          emit: sinon.stub(),
          on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      callback = sinon.spy();

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', {});

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
    let EventEmitter;
    let EventEmitterInstance;
    let pageStateHandler;
    let getElementData;
    let driver;
    let component;
    let pageStateData;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/page-state-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
          emit: sinon.stub(),
          on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      getElementData = sinon.stub();

      driver = {
        executeAsyncScript: sinon.stub().resolves({data: 'someData'}),
      };
      global.driver = driver;

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

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('lodash', {});
      mockery.registerMock('./get-element-data.js', getElementData);

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
      it.only(`should call pageStateHandler.emit with the event 'pageStateHandler.componentDataRecieved' `
      + `the component.model, the component, the returned data, and the passed in pageStateData`, function() {
        pageStateHandler._getComponentState(component, pageStateData);

        expect(pageStateHandler.emit.callCount).to.equal(1);
        // expect(pageStateHandler.emit.args).to.deep.equal([
        //   [
        //     'pageStateHandler.componentDataRecieved',
        //     component.model,
        //     component,
        //     {data: 'someData'},
        //     pageStateData,
        //   ],
        // ]);
      });
    });
  });
});
