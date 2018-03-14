'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-actions.js', function() {
  describe('on file being required', function() {
    let validateActions;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-actions.js');

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

    it('should set the object prototype of validateActions to a new EventEmitter', function() {
      validateActions = require('../../../../../lib/util/validators/validate-actions.js');

      expect(Object.getPrototypeOf(validateActions)).to.deep.equal(EventEmitterInstance);
    });

    it('should call validateActions.on with validateActions.actionReadyToValidate'
      + 'and validateActions._validateAction', function() {
      validateActions = require('../../../../../lib/util/validators/validate-actions.js');

      expect(validateActions.on.args[0]).to.deep.equal([
        'validateActions.actionReadyToValidate',
        validateActions._validateAction,
      ]);
    });

    it('should call validateActions.on with validateActions.preconditionsReadyToValidate'
      + 'and validateActions._validatePreconditions', function() {
      validateActions = require('../../../../../lib/util/validators/validate-actions.js');

      expect(validateActions.on.args[1]).to.deep.equal([
        'validateActions.preconditionsReadyToValidate',
        validateActions._validatePreconditions,
      ]);
    });

    it('should call validateActions.on with validateActions.parametersReadyToValidate'
      + 'and validateActions._validateParameters', function() {
      validateActions = require('../../../../../lib/util/validators/validate-actions.js');

      expect(validateActions.on.args[2]).to.deep.equal([
        'validateActions.parametersReadyToValidate',
        validateActions._validateParameters,
      ]);
    });

    it('should call validateActions.on 3 times', function() {
      validateActions = require('../../../../../lib/util/validators/validate-actions.js');

      expect(validateActions.on.callCount).to.equal(3);
    });
  });

  describe('validate', function() {
    let instanceName;
    let componentName;
    let validateActions;
    let MbttError;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-actions.js');

      instanceName = 'instanceName';
      componentName = 'componentName';

      MbttError = {
        ACTION: {
          ACTIONS_NOT_OBJECT: sinon.stub(),
          ACTION_TYPE_ERROR: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateActions = require('../../../../../lib/util/validators/validate-actions.js');
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should throw an error if the passed in actions is not an object', function() {
      MbttError.ACTION.ACTIONS_NOT_OBJECT.throws(
        {message: `Actions for '${instanceName}' was not returned as an Object by parent component '${componentName}'`}
      );

      expect(validateActions.validate.bind(null, [], instanceName, componentName)).to.throw(
        `Actions for 'instanceName' was not returned as an Object by parent component 'componentName'`
      );
    });

    describe('for each key in the passed in actions object', function() {
      describe('if the actions object has the property key', function() {
        it('should throw an error if action is not an object', function() {
          let actions = {
            ACTION_ONE: [],
          };
          MbttError.ACTION.ACTION_TYPE_ERROR.throws(
            {message: `Action 'ACTION_ONE' for '${instanceName}' is not an object`}
          );

          expect(validateActions.validate.bind(null, actions, instanceName, componentName)).to.throw(
            `Action 'ACTION_ONE' for 'instanceName' is not an object`
          );
        });

        it('should call validateActions.emit once with the event \'validateActions.actionReadyToValidate\''
          + 'action, actionName, and componentName', function() {
          let actions = {
            ACTION_ONE: {
              key: 'value',
            },
          };
          validateActions.validate(actions, instanceName, componentName);

          expect(validateActions.emit.args).to.deep.equal([
            ['validateActions.actionReadyToValidate', {key: 'value'}, 'ACTION_ONE', 'componentName'],
          ]);
        });
      });
      describe('if the actions object does not have the property key', function() {
        it('should not call validateActions.emit', function() {
          let actions = {
            key: 'value',
            hasOwnProperty: sinon.stub().returns(false),
          };

          validateActions.validate(actions, instanceName, componentName);

          expect(validateActions.emit.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_validateAction', function() {
    let instanceName;
    let componentName;
    let validateActions;
    let MbttError;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-actions.js');

      instanceName = 'instanceName';
      componentName = 'componentName';

      MbttError = {
        ACTION: {
          ACTION_TYPE_ERROR: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateActions = require('../../../../../lib/util/validators/validate-actions.js');
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in action has preconditions property', function() {
      it('should throw an error if the preconditions is not a function', function() {
        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {message: `preconditions for 'actionName' of component '${componentName}' must be a function`}
        );

        expect(validateActions._validateAction.bind(null, {preconditions: {}}, instanceName, componentName)).to.throw(
          `preconditions for 'actionName' of component 'componentName' must be a function`
        );
      });

      it('should call validateActions.emit once with the event \'validateActions.preconditionsReadyToValidate\''
        + 'preconditions, actionName, and componentName', function() {
        let action = {
          preconditions: sinon.stub().returns(['array', 'of', 'preconditions']),
          perform: sinon.stub(),
          effects: sinon.stub(),
        };
        validateActions._validateAction(action, 'ACTION_ONE', componentName);

        expect(validateActions.emit.args).to.deep.equal([
          [
            'validateActions.preconditionsReadyToValidate',
            ['array', 'of', 'preconditions'],
            'ACTION_ONE',
            'componentName',
          ],
        ]);
      });
    });

    describe('if the passed in action has parameters property', function() {
      it('should throw an error if the parameters is not an Array', function() {
        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {message: `The parameters property  for 'actionName' of component '${componentName}' must be an Array`}
        );

        expect(validateActions._validateAction.bind(null, {parameters: {}}, instanceName, componentName)).to.throw(
          `The parameters property  for 'actionName' of component 'componentName' must be an Array`
        );
      });

      it('should call validateActions.emit once with the event \'validateActions.parametersReadyToValidate\''
        + 'parameters, actionName, and componentName', function() {
        let action = {
          parameters: [{name: 'param1'}],
          perform: sinon.stub(),
          effects: sinon.stub(),
        };
        validateActions._validateAction(action, 'ACTION_ONE', componentName);

        expect(validateActions.emit.args).to.deep.equal([
          [
            'validateActions.parametersReadyToValidate',
            [{name: 'param1'}],
            'ACTION_ONE',
            'componentName',
          ],
        ]);
      });
    });

    it('should throw an error if the perform property is undefined or not a function', function() {
      let action = {
        perform: {},
        effects: sinon.stub(),
      };

      MbttError.ACTION.ACTION_TYPE_ERROR.throws(
        {message: `perform is required for 'ACTION_ONE' of component '${componentName}' and must be a function`}
      );

      expect(validateActions._validateAction.bind(null, action, 'ACTION_ONE', componentName)).to.throw(
        `perform is required for 'ACTION_ONE' of component 'componentName' and must be a function`
      );
    });
    it('should throw an error if the effects property is undefined or not a function', function() {
      let action = {
        perform: sinon.stub(),
      };

      MbttError.ACTION.ACTION_TYPE_ERROR.throws(
        {message: `effects is required for 'ACTION_ONE' of component '${componentName}' and must be a function`}
      );

      expect(validateActions._validateAction.bind(null, action, 'ACTION_ONE', componentName)).to.throw(
        `effects is required for 'ACTION_ONE' of component 'componentName' and must be a function`
      );
    });
  });

  describe('_validatePreconditions', function() {
    let componentName;
    let actionName;
    let validateActions;
    let MbttError;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-actions.js');

      componentName = 'componentName';
      actionName = 'actionName';

      MbttError = {
        ACTION: {
          ACTION_TYPE_ERROR: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateActions = require('../../../../../lib/util/validators/validate-actions.js');
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should throw an error if the passed in preconditions is not an Array', function() {
      MbttError.ACTION.ACTION_TYPE_ERROR.throws(
        {message: `preconditions for '${actionName}' of component '${componentName}' must return an array`}
      );

      expect(validateActions._validatePreconditions.bind(null, {}, actionName, componentName)).to.throw(
        `preconditions for 'actionName' of component 'componentName' must return an array`
      );
    });

    describe('for each precondition in the passed in preconditions array', function() {
      it('should throw an error if the precondition is not an Array', function() {
        let preconditions = [
          ['isTrue', 'myElement.displayed'],
          {},
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `Precondition found at index '1' of preconditions`
              + `for action '${actionName}' of component '${componentName}' must be an Array`,
          }
        );

        expect(validateActions._validatePreconditions.bind(null, preconditions, actionName, componentName)).to.throw(
          `Precondition found at index '1' of preconditions`
            + `for action 'actionName' of component 'componentName' must be an Array`
        );
      });

      it('should throw an error if the precondition is not an Array', function() {
        let preconditions = [
          [1, 'myElement2.displayed'],
          ['isTrue', 'myElement.displayed'],
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `Precondition found at index '0' of preconditions `
              + `for action '${actionName}' of component '${componentName}' must have `
              + `a string value at the 0 index to denote chai assertion type`,
          }
        );

        expect(validateActions._validatePreconditions.bind(null, preconditions, actionName, componentName)).to.throw(
          `Precondition found at index '0' of preconditions `
            + `for action 'actionName' of component 'componentName' must have `
            + `a string value at the 0 index to denote chai assertion type`
        );
      });
    });
  });

  describe('_validateParameters', function() {
    let componentName;
    let actionName;
    let validateActions;
    let MbttError;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-actions.js');

      componentName = 'componentName';
      actionName = 'actionName';

      MbttError = {
        ACTION: {
          ACTION_TYPE_ERROR: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      validateActions = require('../../../../../lib/util/validators/validate-actions.js');
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each parameter in the passed in parameters array', function() {
      it('should throw an error if the parameter is not an Object', function() {
        let parameters = [
          ['some', 'array'],
          {},
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `Paramter found at index '0' of parameters `
            + `for action '${actionName}' of component '${componentName}' must be an Object`,
          }
        );

        expect(validateActions._validateParameters.bind(null, parameters, actionName, componentName)).to.throw(
          `Paramter found at index '0' of parameters `
            + `for action 'actionName' of component 'componentName' must be an Object`
        );
      });

      it('should throw an error if the parameter does not have the required name field'
        + 'or its not a string', function() {
        let parameters = [
          {name: 1},
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `The name property is required for parameter found at index '0' `
              + `of parameters for action '${actionName}' of component '${componentName}' and must be a string`,
          }
        );

        expect(validateActions._validateParameters.bind(null, parameters, actionName, componentName)).to.throw(
          `The name property is required for parameter found at index '0' `
            + `of parameters for action 'actionName' of component 'componentName' and must be a string`
        );
      });

      it('should throw an error if the parameter does not have the required generate field'
        + 'or its not a function', function() {
        let parameters = [
          {name: 'name', generate: 'im not a function'},
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `The generate property is required for parameter found at index '0' `
              + `of parameters for action '${actionName}' of component '${componentName}' and must be a function`,
          }
        );

        expect(validateActions._validateParameters.bind(null, parameters, actionName, componentName)).to.throw(
          `The generate property is required for parameter found at index '0' `
            + `of parameters for action '${actionName}' of component '${componentName}' and must be a function`
        );
      });

      it('should throw no errors when parameter is an object with string'
        + ' for a name and function for generate', function() {
        let parameters = [
          {name: 'name', generate: sinon.stub()},
        ];

        MbttError.ACTION.ACTION_TYPE_ERROR.throws(
          {
            message: `I Threw`,
          }
        );

        expect(validateActions._validateParameters.bind(null, parameters, actionName, componentName)).to.not.throw();
      });
    });
  });
});
