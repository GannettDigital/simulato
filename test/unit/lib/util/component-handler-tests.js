'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe.only('lib/util/component-handler.js', function() {
  describe('on file being required', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

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

    it('should set the object prototype of componentHandler to a new EventEmitter', function() {
      componentHandler = require('../../../../lib/util/component-handler.js');

      expect(Object.getPrototypeOf(componentHandler)).to.deep.equal(EventEmitterInstance);
    });

    it('should call componentHandler.on once', function() {
      componentHandler = require('../../../../lib/util/component-handler.js');

      expect(componentHandler.on.callCount).to.equal(1);
    });

    it('should call componentHandler.on with the event \'componentHandler.configured\' and the '
      + 'function componentHandler._loadComponents', function() {
        componentHandler = require('../../../../lib/util/component-handler.js');

      expect(componentHandler.on.args[0]).to.deep.equal([
        'componentHandler.configured',
        componentHandler._loadComponents,
      ]);
    });
  });

  describe('getComponent', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      callback = sinon.stub();

      mockery.registerMock('events', {EventEmitter});

      componentHandler = require('../../../../lib/util/component-handler.js');
      componentHandler._components = {
        someType: {name: 'aComponent'},
      };
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in type exists in componentHandler._components', function() {
      it('should call the passed in callback with null and that component', function() {
        componentHandler.getComponent('someType', callback);

        expect(callback.args).to.deep.equal([[null, {name: 'aComponent'}]]);
      });
    });

    describe('if the passed in type DOES NOT exist in componentHandler._components', function() {
      it('shoudl call the passed in callback once', function() {
        componentHandler.getComponent('someOtherType', callback);

        expect(callback.callCount).to.equal(1);
      });
      it('should call the passed in callback with an error', function() {
        componentHandler.getComponent('someOtherType', callback);

        expect(callback.args[0][0]).to.be.a('Error');
      });
    });
  });

  describe('getComponents', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      callback = sinon.stub();

      mockery.registerMock('events', {EventEmitter});

      componentHandler = require('../../../../lib/util/component-handler.js');
      componentHandler._components = {
        type1: {name: 'component1'},
        type2: {name: 'component2'},
      };
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call the passed in callback with null and the componentHandler._components', function() {
      componentHandler.getComponents(callback);

      expect(callback.args).to.deep.equal([
        [
          null,
          {
            type1: {name: 'component1'},
            type2: {name: 'component2'},
          },
        ],
      ]);
    });
  });

  describe('getComponentActions', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      callback = sinon.stub();

      mockery.registerMock('events', {EventEmitter});

      componentHandler = require('../../../../lib/util/component-handler.js');
      componentHandler._components = {
        type1: {
          name: 'component1',
          type: 'type1',
          actions: {
            ACTION_1: {},
            ACTION_2: {},
          },
        },
        type2: {
          name: 'component2',
          type: 'type2',
          actions: {
            ACTION_1: {},
            ACTION_2: {},
            ACTION_3: {},
          },
        },
      };
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each component in componentHandler._components', function() {
      describe('for each actionName inside that component inside component.actions', function() {
        it('should add a string `type.actionName` to the to set returned by the passed in callback', function() {
          let expectedActionSet = new Set();
          expectedActionSet.add('type1.ACTION_1');
          expectedActionSet.add('type1.ACTION_2');
          expectedActionSet.add('type2.ACTION_1');
          expectedActionSet.add('type2.ACTION_2');
          expectedActionSet.add('type2.ACTION_3');

          componentHandler.getComponentActions(callback);

          expect(callback.args).to.deep.equal([[expectedActionSet]]);
        });
      });
    });
  });

  describe('_loadComponents', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let paths;
    let comp1;
    let comp2;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      paths = [
        'path/to/comp1',
        'path/to/comp2',
      ];
      comp1 = {
        type: 'type1',
      };
      comp2 = {
        type: 'type2',
      };

      global.SimulatoError = {
        COMPONENT: {
          NON_UNIQUE_COMPONENT: sinon.stub(),
        },
      };

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path/to/comp1', comp1);
      mockery.registerMock('path/to/comp2', comp2);

      componentHandler = require('../../../../lib/util/component-handler.js');
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each path in the passed in paths', function() {
      describe('if the required in component from the path does not already exist', function() {
        it('should add the components to componentHandler._components', function() {
          componentHandler._loadComponents(paths);

          expect(componentHandler._components).to.deep.equal({
            type1: comp1,
            type2: comp2,
          });
        });
      });

      describe('if the required in component alread exists', function() {
        it('should throw an error', function() {
          let error = new Error('An error occurred!');
          SimulatoError.COMPONENT.NON_UNIQUE_COMPONENT.throws(error);
          paths[1] = paths[0];

          expect(componentHandler._loadComponents.bind(null, paths)).to.throw('An error occurred!');
        });
      });
    });
  });

  describe('configure', function() {
    let componentHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let path;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/component-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      global.SimulatoError = {
        COMPONENT: {
          NO_COMPONENTS_FOUND: sinon.stub(),
        },
      };

      path = 'path/to/files';

      mockery.registerMock('events', {EventEmitter});

      componentHandler = require('../../../../lib/util/component-handler.js');
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it(`should call componentHandler.emit once`, function() {
      componentHandler.configure(path);

      expect(componentHandler.emit.callCount).to.equal(1);
    });

    it(`should call componentHandler.emit with the event 'componentHandler.findFiles' `
      + `and the passed in path inside an array`, function() {
      componentHandler.configure(path);

      expect(componentHandler.emit.args[0].splice(0, 2)).to.deep.equal([
        'componentHandler.findFiles', ['path/to/files'],
      ]);
    });

    it(`should call componentHandler.emit a callback function as the last parameter`, function() {
      componentHandler.configure(path);

      expect(componentHandler.emit.args[0].splice(2, 1)[0]).to.be.a('function');
    });

    describe('when the events callback is called', function() {
      describe('if the returned array has files in it', function() {
        it(`should call componentHandler.emit twice`, function() {
          componentHandler.emit.onCall(0).callsArgWith(2, ['path/to/file']);

          componentHandler.configure(path);

          expect(componentHandler.emit.callCount).to.equal(2);
        });

        it(`should call componentHandler.emit with the event 'componentHandler.filesReadyToValidate' `
          + `and the passed in path inside an array`, function() {
          componentHandler.emit.onCall(0).callsArgWith(2, ['path/to/file']);

          componentHandler.configure(path);

          expect(componentHandler.emit.args[1].splice(0, 2)).to.deep.equal([
            'componentHandler.filesReadyToValidate', ['path/to/file'],
          ]);
        });

        it(`should call componentHandler.emit a callback function as the last parameter`, function() {
          componentHandler.emit.onCall(0).callsArgWith(2, ['path/to/file']);

          componentHandler.configure(path);

          expect(componentHandler.emit.args[1].splice(2, 1)[0]).to.be.a('function');
        });

        describe('when the componentHandler.filesReadyToValidate event callback is called', function() {
          it(`should call componentHandler.emit thrice`, function() {
            componentHandler.emit.onCall(0).callsArgWith(2, ['path/to/file']);
            componentHandler.emit.onCall(1).callsArgWith(2, ['path/to/validated/file']);

            componentHandler.configure(path);

            expect(componentHandler.emit.callCount).to.equal(3);
          });

          it(`should call componentHandler.emit with the event 'componentHandler.configured' `
            + `and the returned validated files array`, function() {
            componentHandler.emit.onCall(0).callsArgWith(2, ['path/to/file']);
            componentHandler.emit.onCall(1).callsArgWith(2, ['path/to/validated/file']);

            componentHandler.configure(path);

            expect(componentHandler.emit.args[2].splice(0, 2)).to.deep.equal([
              'componentHandler.configured', ['path/to/validated/file'],
            ]);
          });
        });
      });

      describe('if the returned array does not contain files', function() {
        it('should throw an error', function() {
          let error = new Error('An error occurred!');
          SimulatoError.COMPONENT.NO_COMPONENTS_FOUND.throws(error);
          componentHandler.emit.onCall(0).callsArgWith(2, []);

          expect(componentHandler.configure.bind(null, path)).to.throw('An error occurred!');
        });
      });
    });
  });
});
