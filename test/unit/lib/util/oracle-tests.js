'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/oracle.js', function() {
  describe('runAssertions', function() {
    let assert;
    let _;
    let callback;
    let oracle;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/oracle.js');

      callback = sinon.spy();
      assert = {
        isTrue: sinon.stub(),
        equal: sinon.stub(),
      };
      _ = {
        get: sinon.stub(),
      };

      mockery.registerMock('chai', {assert});
      mockery.registerMock('lodash', _);

      oracle = require('../../../../lib/util/oracle.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call _.get once if there is one assertions', function() {
      let assertions = [['isTrue', 'pageState.value', true]];
      _.get.returns(true);

      oracle.runAssertions({}, {}, assertions, callback);

      expect(_.get.callCount).to.equal(1);
    });

    it('should call _.get thrice if there are three assertions', function() {
      let assertions = [
        ['isTrue', 'pageState.value', true],
        ['isTrue', 'dataStore.value', true],
        ['isTrue', 'dataStore.value', true],
      ];
      _.get.returns(true);

      oracle.runAssertions({}, {}, assertions, callback);

      expect(_.get.callCount).to.equal(3);
    });

    it('should call _.get with the passed in state and the second element of an assertion array', function() {
      let assertions = [['isTrue', 'pageState.value', true]];
      _.get.returns(true);

      oracle.runAssertions({property: 'myProperty'}, {}, assertions, callback);

      expect(_.get.args).to.deep.equal([
        [
          {
            pageState: {property: 'myProperty'},
            dataStore: {},
          },
          'pageState.value',
        ],
      ]);
    });

    it('should call the assert method which is the first element in the assertion array', function() {
      let assertions = [['isTrue', 'dataStore.value', true]];
      _.get.returns(true);

      oracle.runAssertions({}, {}, assertions, callback);

      expect(assert.isTrue.callCount).to.equal(1);
    });

    it('should call the assert method with result of the call to _.get and all elements after the second element ' +
            'in the assertion array as paremeters ', function() {
      let assertions = [['equal', 'pageState.value', true, 'element', 'anotherElement']];
      _.get.returns(true);

      oracle.runAssertions({}, {}, assertions, callback);

      expect(assert.equal.args).to.deep.equal([
        [
          true,
          true,
          'element',
          'anotherElement',
          'pageState.value',
        ],
      ]);
    });

    describe('when the assert method throws', function() {
      it('should call the passed in callback once with the error thrown', function() {
        let error = new Error('The assertion did not pass');
        let assertions = [['isTrue', 'pageState.value', true]];
        _.get.returns(true);
        assert.isTrue.throws(error);

        oracle.runAssertions({}, {}, assertions, callback);

        expect(callback.args).to.deep.equal([
          [error],
        ]);
      });
    });

    describe('when the assert method does not throw', function() {
      it('should call the passed in callback once with no parameters', function() {
        let assertions = [['isTrue', 'dataStore.value', true]];
        _.get.returns(true);

        oracle.runAssertions({}, {}, assertions, callback);

        expect(callback.args).to.deep.equal([[]]);
      });
    });
  });

  describe('deepEqual', function() {
    let assert;
    let callback;
    let oracle;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/oracle.js');

      callback = sinon.spy();
      assert = {
        deepEqual: sinon.stub(),
      };

      mockery.registerMock('chai', {assert});
      mockery.registerMock('lodash', {});

      oracle = require('../../../../lib/util/oracle.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call assert.deepEqual once with the passed in objectOne and objectTwo', function() {
      let objectOne = {propertyOne: 'myFirstProperty'};
      let objectTwo = {propertyTwo: 'mySecondProperty'};

      oracle.deepEqual(objectOne, objectTwo, callback);

      expect(assert.deepEqual.args).to.deep.equal([[
        {propertyOne: 'myFirstProperty'},
        {propertyTwo: 'mySecondProperty'},
      ]]);
    });

    describe('when assert.deepEqual throws', function() {
      it('should call passed in callback once with the error thrown', function() {
        let error = new Error('The assertion did not pass');
        assert.deepEqual.throws(error);

        oracle.deepEqual({}, {}, callback);

        expect(callback.args).to.deep.equal([
          [error],
        ]);
      });
    });

    describe('when assert.deepEqual does not throw', function() {
      it('should call the passed in callback once with no parameters', function() {
        oracle.deepEqual({}, {}, callback);

        expect(callback.args).to.deep.equal([[]]);
      });
    });
  });
});
