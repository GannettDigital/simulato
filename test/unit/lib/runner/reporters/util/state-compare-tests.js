'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/reporters/util/state-compare.js', function() {
  describe('printDifference', function() {
    let stateCompare;
    let samplePageState;
    let sampleExpectedState;
    let sampleDifference;
    let callback;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      samplePageState = {
        displayed: true,
        component1: {
          displayed: true,
          value: '',
        },
        component2: {
          displayed: false,
        },
      };

      sampleExpectedState = {
        displayed: true,
        component1: {
          displayed: true,
          value: '',
        },
        component2: {
          displayed: true,
        },
      };

      sampleDifference = {
        component2: {
          displayed: true,
        },
      };

      callback = sinon.stub();

      mockery.registerMock('lodash', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      stateCompare._findDifference = sinon.stub();
      stateCompare._printKeys = sinon.stub();
      stateCompare._printRed = sinon.stub();
      stateCompare._printGreen = sinon.stub();
      stateCompare._printRed.returns(`redText`);
      stateCompare._printGreen.returns(`greenText`);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call _findDifference once', function() {
      stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

      expect(stateCompare._findDifference.callCount).to.equal(1);
    });

    it('should call _findDifference with the passed in pageState and ExpectedState as first 2 params', function() {
      stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

      expect(stateCompare._findDifference.args[0].splice(0, 2)).to.deep.equal([
        {
          displayed: true,
          component1: {
            displayed: true,
            value: '',
          },
          component2: {
            displayed: false,
          },
        },
        {
          displayed: true,
          component1: {
            displayed: true,
            value: '',
          },
          component2: {
            displayed: true,
          },
        },
      ]);
    });

    it('should call _findDifference with a function as the last param', function() {
      stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

      expect(stateCompare._findDifference.args[0].splice(2)[0]).to.be.a('function');
    });

    describe('when the _findDifference callback is called', function() {
      it('should call printRed once with `    Page State`', function() {
        stateCompare._findDifference.callsArgWith(2, sampleDifference);

        stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

        expect(stateCompare._printRed.args).to.deep.equal([
          ['    Page State'],
        ]);
      });

      it('should call printGreen once with `    Expected State`', function() {
        stateCompare._findDifference.callsArgWith(2, sampleDifference);

        stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

        expect(stateCompare._printGreen.args).to.deep.equal([
          ['    Expected State'],
        ]);
      });

      it('should set stateCompare._indentCount to 0 then get incremented to 1', function() {
        stateCompare._findDifference.callsArgWith(2, sampleDifference);
        stateCompare._indentCount = 9;

        stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

        expect(stateCompare._indentCount).to.equal(2);
      });

      it('should call _printKeys once with difference, and expectedState', function() {
        stateCompare._findDifference.callsArgWith(2, sampleDifference);

        stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

        expect(stateCompare._printKeys.args).to.deep.equal([[
          {
            component2: {
              displayed: true,
            },
          },
          {
            displayed: true,
            component1: {
              displayed: true,
              value: '',
            },
            component2: {
              displayed: true,
            },
          },
        ]]);
      });

      it('should call the passed in callback with stateCompare._compareResult', function() {
        stateCompare._findDifference.callsArgWith(2, sampleDifference);

        stateCompare.printDifference(samplePageState, sampleExpectedState, callback);

        expect(callback.args).to.deep.equal([[
          '\nredText\ngreenText\n  {\n  }',
        ]]);
      });
    });
  });

  describe('_findDifference', function() {
    let Emitter;
    let stateCompare;
    let _;
    let callback;
    let sampleObject;
    let sampleBase;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      _ = {
        transform: sinon.stub(),
        isEqual: sinon.stub(),
        isObject: sinon.stub(),
      };

      callback = sinon.spy();

      sampleObject = {
        key1: 'value1',
        key2: 'value2',
        key3: {
          key3_1: 'value3_1',
        },
        key4: {
          key4_1: 'value4_1',
        },
      };

      sampleBase = {
        key1: 'value1',
        key2: 'different_value1',
        key3: {
          key3_1: 'different_value2',
        },
        key4: {
          key4_1: 'value4_1',
        },
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call _.transform the passed in object as the first param', function() {
      stateCompare._findDifference(sampleObject, sampleBase, callback);

      expect(_.transform.args[0].slice(0, 1)).to.deep.equal([
        {
          key1: 'value1',
          key2: 'value2',
          key3: {
            key3_1: 'value3_1',
          },
          key4: {
            key4_1: 'value4_1',
          },
        },
      ]);
    });

    it('should call _.transform once', function() {
      stateCompare._findDifference(sampleObject, sampleBase, callback);

      expect(_.transform.callCount).to.equal(1);
    });

    describe('when _.transform callback is called', function() {
      describe('if the value and base[key] are different', function() {
        it('should call _.isObject once if the first value is NOT an object', function() {
          let base = {key1: {key2: 'value3'}};
          _.transform.onCall(0).callsArgWith(1, {}, {key2: 'value2'}, 'key1');
          _.isEqual.returns(false);
          _.isObject.returns(false);

          stateCompare._findDifference({key1: {key2: 'value2'}}, base, callback);

          expect(_.isObject.callCount).to.equal(1);
        });
        it('should call _.isObject twice if the first value is an object', function() {
          let base = {key1: {key2: 'value3'}};
          _.transform.onCall(0).callsArgWith(1, {}, {key2: 'value2'}, 'key1');
          _.isEqual.returns(false);
          _.isObject.returns(true);

          stateCompare._findDifference({key1: {key2: 'value2'}}, base, callback);

          expect(_.isObject.callCount).to.equal(2);
        });
        describe('if both the value and the base[key] are objects', function() {
          it('should call _.transform with value as the first param', function() {
            let base = {key1: {key2: 'value3'}};
            _.transform.onCall(0).callsArgWith(1, {}, {key2: 'value2'}, 'key1');
            _.isEqual.returns(false);
            _.isObject.returns(true);

            stateCompare._findDifference({key1: {key2: 'value2'}}, base, callback);

            expect(_.transform.args[1].slice(0, 1)).to.deep.equal([
              {
                key2: 'value2',
              },
            ]);
          });
        });
        describe('if both the value and the base[key] are NOT objects', function() {
          it('should set the result[key] to the value', function() {
            let result = {};
            let base = {key1: 'value3'};
            _.transform.onCall(0).callsArgWith(1, result, 'value2', 'key1');
            _.isEqual.returns(false);
            _.isObject.returns(false);

            stateCompare._findDifference({key1: 'value2'}, base, callback);

            expect(result).to.deep.equal({
              key1: 'value2',
            });
          });
        });
      });
      describe('if the value and the base[key] are the same', function() {
        it('should not call _.isObject', function() {
          let base = {key1: 'value1'};
          _.transform.callsArgWith(1, {}, 'value1', 'key1');
          _.isEqual.returns(true);

          stateCompare._findDifference(sampleObject, base, callback);

          expect(_.isObject.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_printKeys', function() {
    let Emitter;
    let stateCompare;
    let sampleDifference;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sampleDifference = {
        key1: 'value1',
      };

      sampleDifference.hasOwnProperty = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each key in passed in difference', function() {
      describe('if the difference has the property key', function() {
        it('should call stateCompare.emit with the event \'stateCompare.keyReadyToPrint\''
          + 'they key, difference[key], and base[key]', function() {
          sampleDifference.hasOwnProperty.returns(true);

          stateCompare._printKeys(sampleDifference, {key1: 'value2'});

          expect(stateCompare.emit.args[0]).to.deep.equal([
            'stateCompare.keyReadyToPrint', 'key1', 'value1', 'value2',
          ]);
        });
      });
      describe('if it does not have the property key', function() {
        it('should call stateCompare.emit 0 times', function() {
          sampleDifference.hasOwnProperty.returns(false);

          stateCompare._printKeys(sampleDifference, {key1: 'value2'});

          expect(stateCompare.emit.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_printKey', function() {
    let Emitter;
    let stateCompare;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      _ = {
        isObject: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      stateCompare._indent = sinon.stub();
      stateCompare._printRed = sinon.stub();
      stateCompare._printGreen = sinon.stub();
      stateCompare._indent.returns('keyString ');
      stateCompare._printRed.returns(`redText`);
      stateCompare._printGreen.returns(`greenText`);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in difference value is an array', function() {
      it('should call stateCompare.emit with the event \'stateCompare.differenceValueFoundAsArray\''
        + 'differenceValue, baseValue, and keyString as params', function() {
        let parentKey = 'key1';
        let differenceValue = ['element1', 'element2'];
        let baseValue = 'baseValue';

        stateCompare._printKey(parentKey, differenceValue, baseValue);

        expect(stateCompare.emit.args).to.deep.equal([
          [
            'stateCompare.differenceValueFoundAsArray',
            ['element1', 'element2'],
            'baseValue',
            'keyString key1',
          ],
        ]);
      });
    });

    describe('if the passed in difference value is an object', function() {
      it('should call stateCompare.emit with the event \'stateCompare.differenceValueFoundAsObject\''
        + 'differenceValue, baseValue, keyString, and parentKey as params', function() {
        let parentKey = 'key1';
        let differenceValue = {key2: 'value2'};
        let baseValue = 'baseValue';
        _.isObject.returns(true);

        stateCompare._printKey(parentKey, differenceValue, baseValue);

        expect(stateCompare.emit.args).to.deep.equal([
          [
            'stateCompare.differenceValueFoundAsObject',
            {key2: 'value2'},
            'baseValue',
            'keyString key1',
            'key1',
          ],
        ]);
      });
    });

    describe('if the passed in difference value is not an object or array', function() {
      describe('if the difference value is a string', function() {
        it('should call ._printRed once with keyString and difference value as single quotes', function() {
          let parentKey = 'key1';
          let differenceValue = 'value2';
          let baseValue = 'baseValue';
          _.isObject.returns(false);

          stateCompare._printKey(parentKey, differenceValue, baseValue);

          expect(stateCompare._printRed.args).to.deep.equal([
            [`keyString key1: 'value2',`],
          ]);
        });

        describe('if the baseValue is not an object', function() {
          describe('if the base value is a string', function() {
            it('should call ._printGreen once with keyString and base value as single quotes', function() {
              let parentKey = 'key1';
              let differenceValue = 'value2';
              let baseValue = 'baseValue';
              _.isObject.returns(false);

              stateCompare._printKey(parentKey, differenceValue, baseValue);

              expect(stateCompare._printGreen.args).to.deep.equal([
                [`keyString key1: 'baseValue',`],
              ]);
            });
          });
        });
        describe('if the baseValue is an object', function() {
          it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
            + 'baseValue, _printGreen, and keyString as params', function() {
            let parentKey = 'key1';
            let differenceValue = 'value2';
            let baseValue = 'baseValue';
            _.isObject.onCall(0).returns(false);
            _.isObject.onCall(1).returns(true);

            stateCompare._printKey(parentKey, differenceValue, baseValue);

            expect(stateCompare.emit.args).to.deep.equal([
              [
                'stateCompare.childReadyForPrint',
                'baseValue',
                stateCompare._printGreen,
                'keyString key1',
              ],
            ]);
          });
        });
      });
      describe('if the difference value is not a string', function() {
        it('should call ._printRed once with keyString and difference value', function() {
          let parentKey = 'key1';
          let differenceValue = 1;
          let baseValue = 'baseValue';
          _.isObject.returns(false);

          stateCompare._printKey(parentKey, differenceValue, baseValue.value);

          expect(stateCompare._printRed.args).to.deep.equal([
            [`keyString key1: 1,`],
          ]);
        });
      });
    });

    it('should concatenate ._compareResult with the \'\\nredText\\ngreenText\'', function() {
      let parentKey = 'key1';
      let differenceValue = 'value2';
      let baseValue = 'baseValue';
      _.isObject.returns(false);

      stateCompare._printKey(parentKey, differenceValue, baseValue);

      expect(stateCompare._compareResult).to.equal('\nredText\ngreenText');
    });
  });

  describe('_handleDifferenceArrayValue', function() {
    let Emitter;
    let stateCompare;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      _ = {
        isObject: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      stateCompare._indent = sinon.stub();
      stateCompare._printGreen = sinon.stub();
      stateCompare._indent.returns('');
      stateCompare._printGreen.returns(`greenText`);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the baseValue is NOT an Array', function() {
      it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
        + 'differenceValue, _printRed, and keyString as params', function() {
        let differenceValue = 'differenceValue';
        let baseValue = 'baseValue';
        let keyString = 'keyString';

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare.emit.args[0]).to.deep.equal([
          'stateCompare.childReadyForPrint',
          'differenceValue',
          stateCompare._printRed,
          'keyString',
        ]);
      });
      describe('if baseValue is an Object', function() {
        it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
          + 'differenceValue, _printGreen, and keyString as params', function() {
          let differenceValue = 'differenceValue';
          let baseValue = {key: 'baseValue'};
          let keyString = 'keyString';
          _.isObject.returns(true);

          stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

          expect(stateCompare.emit.args[1]).to.deep.equal([
            'stateCompare.childReadyForPrint',
            {key: 'baseValue'},
            stateCompare._printGreen,
            'keyString',
          ]);
        });

        it('should call stateCompare.emit twice', function() {
          let differenceValue = 'differenceValue';
          let baseValue = {key: 'baseValue'};
          let keyString = 'keyString';
          _.isObject.returns(true);

          stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

          expect(stateCompare.emit.callCount).to.equal(2);
        });
      });
      describe('if baseValue is not an object or an array', function() {
        describe('if the base value is a string', function() {
          it('should call ._printGreen once with keyString and base value in single quotes', function() {
            let differenceValue = 'differenceValue';
            let baseValue = 'baseValue';
            let keyString = 'keyString';
            _.isObject.returns(false);

            stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

            expect(stateCompare._printGreen.args).to.deep.equal([
              [`keyString: 'baseValue',`],
            ]);
          });
        });
        describe('if the base value is NOT a string', function() {
          it('should call ._printGreen once with keyString and base value', function() {
            let differenceValue = 'differenceValue';
            let baseValue = 1;
            let keyString = 'keyString';
            _.isObject.returns(false);

            stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

            expect(stateCompare._printGreen.args).to.deep.equal([
              [`keyString: 1,`],
            ]);
          });
        });
      });

      it('should concatenate ._compareResult with \'\\ngreenText\'', function() {
        let differenceValue = 'differenceValue';
        let baseValue = 1;
        let keyString = 'keyString';
        _.isObject.returns(false);

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare._compareResult).to.equal('\ngreenText');
      });
    });
    describe('if the baseValue is an Array', function() {
      it('should call increment and decrement the indentCount keeping it the same', function() {
        let differenceValue = 'differenceValue';
        let baseValue = ['element1', 'element2'];
        let keyString = 'keyString';
        stateCompare._indentCount = 5;

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare._indentCount).to.equal(5);
      });

      it('should call stateCompare.emit with the event \'stateCompare.readyToPrintKeys\''
        + 'differenceValue and baseValue as params', function() {
        let differenceValue = 'differenceValue';
        let baseValue = ['element1', 'element2'];
        let keyString = 'keyString';

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare.emit.args).to.deep.equal([
          [
            'stateCompare.readyToPrintKeys',
            'differenceValue',
            ['element1', 'element2'],
          ],
        ]);
      });

      it('should call _.indent() once', function() {
        let differenceValue = 'differenceValue';
        let baseValue = ['element1', 'element2'];
        let keyString = 'keyString';

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare._indent.callCount).to.equal(1);
      });

      it('should concatenate ._compareResult with the \'\\nkeyString [\\n],\'', function() {
        let differenceValue = 'differenceValue';
        let baseValue = ['element1', 'element2'];
        let keyString = 'keyString';

        stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);

        expect(stateCompare._compareResult).to.equal('\nkeyString [\n],');
      });
    });
  });

  describe('_handleDifferenceObjectValue', function() {
    let Emitter;
    let stateCompare;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      _ = {
        isObject: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      stateCompare._indent = sinon.stub();
      stateCompare._printGreen = sinon.stub();
      stateCompare._indent.returns('');
      stateCompare._printGreen.returns(`greenText`);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the baseValue is NOT an Object', function() {
      it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
        + 'differenceValue, stateCompare._printRed, and parentKey as params', function() {
        let differenceValue = 'differenceValue';
        let baseValue = 'baseValue';
        let keyString = 'keyString';
        let parentKey = 'parentKey';
        _.isObject.returns(false);

        stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

        expect(stateCompare.emit.args).to.deep.equal([
          [
            'stateCompare.childReadyForPrint',
            'differenceValue',
            stateCompare._printRed,
            'parentKey',
          ],
        ]);
      });

      describe('if the base value is a string', function() {
        it('should call ._printGreen once with keyString and base value in single quotes', function() {
          let differenceValue = 'differenceValue';
          let baseValue = 'baseValue';
          let keyString = 'keyString';
          let parentKey = 'parentKey';
          _.isObject.returns(false);

          stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

          expect(stateCompare._printGreen.args).to.deep.equal([
            [`keyString: 'baseValue',`],
          ]);
        });

        it('should concatenate ._compareResult with \'\\ngreenText\'', function() {
          let differenceValue = 'differenceValue';
          let baseValue = 'baseValue';
          let keyString = 'keyString';
          let parentKey = 'parentKey';
          _.isObject.returns(false);

          stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

          expect(stateCompare._compareResult).to.equal('\ngreenText');
        });
      });
      describe('if the base value is NOT a string', function() {
        it('should call ._printGreen once with keyString and base value', function() {
          let differenceValue = 'differenceValue';
          let baseValue = 1;
          let keyString = 'keyString';
          let parentKey = 'parentKey';
          _.isObject.returns(false);

          stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

          expect(stateCompare._printGreen.args).to.deep.equal([
            [`keyString: 1,`],
          ]);
        });

        it('should concatenate ._compareResult with \'\\ngreenText\'', function() {
          let differenceValue = 'differenceValue';
          let baseValue = 1;
          let keyString = 'keyString';
          let parentKey = 'parentKey';
          _.isObject.returns(false);

          stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

          expect(stateCompare._compareResult).to.equal('\ngreenText');
        });
      });
    });
    describe('if the baseValue is an Object', function() {
      it('should call increment and decrement the indentCount keeping it the same', function() {
        let differenceValue = 'differenceValue';
        let baseValue = {key: 'baseValue'};
        let keyString = 'keyString';
        let parentKey = 'parentKey';
        stateCompare._indentCount = 5;
        _.isObject.returns(true);

        stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

        expect(stateCompare._indentCount).to.equal(5);
      });

      it('should call stateCompare.emit with the event \'stateCompare.readyToPrintKeys\''
        + 'differenceValue and baseValue as params', function() {
        let differenceValue = 'differenceValue';
        let baseValue = {key: 'baseValue'};
        let keyString = 'keyString';
        let parentKey = 'parentKey';
        _.isObject.returns(true);

        stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

        expect(stateCompare.emit.args).to.deep.equal([
          [
            'stateCompare.readyToPrintKeys',
            'differenceValue',
            {key: 'baseValue'},
          ],
        ]);
      });

      it('should call _.indent() once', function() {
        let differenceValue = 'differenceValue';
        let baseValue = {key: 'baseValue'};
        let keyString = 'keyString';
        let parentKey = 'parentKey';
        _.isObject.returns(true);

        stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

        expect(stateCompare._indent.callCount).to.equal(1);
      });

      it('should concatenate ._compareResult with \'\\nkeyString: {\\n},\'', function() {
        let differenceValue = 'differenceValue';
        let baseValue = {key: 'baseValue'};
        let keyString = 'keyString';
        let parentKey = 'parentKey';
        _.isObject.returns(true);

        stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);

        expect(stateCompare._compareResult).to.equal('\nkeyString: {\n},');
      });
    });
  });

  describe('_printChild', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;
    let baseString;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      _ = {
        isObject: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      stateCompare._indent = sinon.stub();
      stateCompare._printGreen = sinon.stub();
      stateCompare._indent.returns('');
      stateCompare._printGreen.returns(`greenText`);

      colorFunc = stateCompare._printGreen;
      baseString = 'baseString';
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in child is an Array', function() {
      it('should call stateCompare.emit with the event \'stateCompare.arrayReadyToStartPrint\''
        + ', with the passed in baseString and colorFunc', function() {
        let child = ['childArray'];

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[0]).to.deep.equal([
          'stateCompare.arrayReadyToStartPrint',
          'baseString',
          stateCompare._printGreen,
        ]);
      });
      it('should call stateCompare.emit with the event \'stateCompare.arrayReadyToPrint\''
        + ', with the passed in child and colorFunc', function() {
        let child = ['childArray'];

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[1]).to.deep.equal([
          'stateCompare.arrayReadyToPrint',
          ['childArray'],
          stateCompare._printGreen,
        ]);
      });
      it('should call stateCompare.emit with the event \'stateCompare.arrayReadyToEndPrint\''
        + ', with the passed in colorFunc', function() {
        let child = ['childArray'];

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[2]).to.deep.equal([
          'stateCompare.arrayReadyToEndPrint',
          stateCompare._printGreen,
        ]);
      });

      it('should call stateCompare.emit 3 times', function() {
        let child = ['childArray'];

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.callCount).to.equal(3);
      });
    });
    describe('if the passed in child is an Object', function() {
      it('should call stateCompare.emit with the event \'stateCompare.objectReadyToStartPrint\''
        + ', with the passed in baseString and colorFunc', function() {
        let child = {key: 'childObject'};
        _.isObject.returns(true);

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[0]).to.deep.equal([
          'stateCompare.objectReadyToStartPrint',
          'baseString',
          stateCompare._printGreen,
        ]);
      });

      it('should call stateCompare.emit with the event \'stateCompare.objectReadyToPrint\''
        + ', with the passed in child and colorFunc', function() {
        let child = {key: 'childObject'};
        _.isObject.returns(true);

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[1]).to.deep.equal([
          'stateCompare.objectReadyToPrint',
          {key: 'childObject'},
          stateCompare._printGreen,
        ]);
      });

      it('should call stateCompare.emit with the event \'stateCompare.objectReadyToEndPrint\''
        + ', with the passed in colorFunc', function() {
        let child = {key: 'childObject'};
        _.isObject.returns(true);

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.args[2]).to.deep.equal([
          'stateCompare.objectReadyToEndPrint',
          stateCompare._printGreen,
        ]);
      });

      it('should call stateCompare.emit 3 times', function() {
        let child = {key: 'childObject'};
        _.isObject.returns(true);

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare.emit.callCount).to.equal(3);
      });
    });
    describe('if the passed in child is not an Array or an Object', function() {
      it('should call _indent once', function() {
        let child = 'child';

        stateCompare._printChild(child, colorFunc, baseString);

        expect(stateCompare._indent.callCount).to.equal(1);
      });
      describe('if the child is a string', function() {
        it('should call the passed in color func with the child surrounded with single quotes', function() {
          let child = 'child';
          let baseString = null;

          stateCompare._printChild(child, colorFunc, baseString);

          expect(colorFunc.args).to.deep.equal([
            [`'child',`],
          ]);
        });

        it('should concatenate ._compareResult with \'\\ngreenText\'', function() {
          let child = 'child';
          let baseString = null;

          stateCompare._printChild(child, colorFunc, baseString);

          expect(stateCompare._compareResult).to.equal('\ngreenText');
        });
      });
      describe('if the child is not a string', function() {
        it('should call the passed in color func with the child', function() {
          let child = 1;
          let baseString = null;

          stateCompare._printChild(child, colorFunc, baseString);

          expect(colorFunc.args).to.deep.equal([
            [`1,`],
          ]);
        });

        it('should concatenate ._compareResult with \'\\ngreenText\'', function() {
          let child = 'child';
          let baseString = null;

          stateCompare._printChild(child, colorFunc, baseString);

          expect(stateCompare._compareResult).to.equal('\ngreenText');
        });
      });
      describe('if there is a baseString passed in', function() {
        it('should call the color func with the base string and child', function() {
          let child = 1;

          stateCompare._printChild(child, colorFunc, baseString);

          expect(colorFunc.args).to.deep.equal([
            [`baseString 1,`],
          ]);
        });
      });
    });
  });

  describe('_printStartOfArray', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');

      colorFunc = sinon.stub();
      colorFunc.returns('coloredString');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should increment indent count once', function() {
      stateCompare._indentCount = 3;

      stateCompare._printStartOfArray(null, colorFunc);

      expect(stateCompare._indentCount).to.equal(4);
    });

    describe('if a string is NOT passed in', function() {
      it('should call the color function once with `[`', function() {
        stateCompare._printStartOfArray(null, colorFunc);

        expect(colorFunc.args).to.deep.equal([
          [`[`],
        ]);
      });

      it('should concatenate ._compareResult with \'\\ncoloredString\'', function() {
        stateCompare._printStartOfArray(null, colorFunc);

        expect(stateCompare._compareResult).to.equal('\ncoloredString');
      });
    });
    describe('if a string is passed in', function() {
      it('should call the color function once with the string and [', function() {
        stateCompare._printStartOfArray('passed string', colorFunc);

        expect(colorFunc.args).to.deep.equal([
          [`passed string: [`],
        ]);
      });

      it('should concatenate ._compareResult with \'\\ncoloredString\'', function() {
        stateCompare._printStartOfArray('passed string', colorFunc);

        expect(stateCompare._compareResult).to.equal('\ncoloredString');
      });
    });
  });

  describe('_printArrayElements', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      colorFunc = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each element in the passed in array', function() {
      it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
        + 'with the element and passed in color func as args', function() {
        stateCompare._printArrayElements(['child1', 'child2'], colorFunc);

        expect(stateCompare.emit.args).to.deep.equal([
          ['stateCompare.childReadyForPrint', 'child1', colorFunc],
          ['stateCompare.childReadyForPrint', 'child2', colorFunc],
        ]);
      });
    });
  });

  describe('_printEndOfArray', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      colorFunc = sinon.stub();
      colorFunc.returns('coloredString');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
      stateCompare._indent = sinon.stub();
      stateCompare._indent.returns('  ');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should decrement the indentcount once', function() {
      stateCompare._indentCount = 8;

      stateCompare._printEndOfArray(colorFunc);

      expect(stateCompare._indentCount).to.equal(7);
    });

    it('should call the passed in color func once with `],`', function() {
      stateCompare._indentCount = 8;

      stateCompare._printEndOfArray(colorFunc);

      expect(colorFunc.args).to.deep.equal([
        [`],`],
      ]);
    });

    it('should call stateCompare._indent once', function() {
      stateCompare._printEndOfArray(colorFunc);

      expect(stateCompare._indent.callCount).to.equal(1);
    });

    it('should concatenate ._compareResult with \'\\n  coloredString\'', function() {
      stateCompare._printEndOfArray(colorFunc);

      expect(stateCompare._compareResult).to.equal('\n  coloredString');
    });
  });

  describe('_printStartOfObject', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
      stateCompare._indent = sinon.stub();
      stateCompare._indent.returns('  ');

      colorFunc = sinon.stub();
      colorFunc.returns('coloredString');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should increment indent count once', function() {
      stateCompare._indentCount = 3;

      stateCompare._printStartOfObject(null, colorFunc);

      expect(stateCompare._indentCount).to.equal(4);
    });

    it('should call .indent once', function() {
      stateCompare._printStartOfObject(null, colorFunc);

      expect(stateCompare._indent.callCount).to.equal(1);
    });

    describe('if a key is NOT passed in', function() {
      it('should call the color function once with `{`', function() {
        stateCompare._printStartOfObject(null, colorFunc);

        expect(colorFunc.args).to.deep.equal([
          [`{`],
        ]);
      });

      it('should concatenate ._compareResult with \'\\n  coloredString\'', function() {
        stateCompare._printStartOfObject(null, colorFunc);

        expect(stateCompare._compareResult).to.equal('\n  coloredString');
      });
    });
    describe('if a key is passed in', function() {
      it('should call the color function once with the string and [', function() {
        stateCompare._printStartOfObject('key', colorFunc);

        expect(colorFunc.args).to.deep.equal([
          [`key: {`],
        ]);
      });

      it('should concatenate ._compareResult with \'\\n  coloredString\'', function() {
        stateCompare._printStartOfObject('key', colorFunc);

        expect(stateCompare._compareResult).to.equal('\n  coloredString');
      });
    });
  });

  describe('_printObjectKeyValues', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;
    let sampleObject;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      colorFunc = sinon.stub();

      sampleObject = {
        key1: 'value1',
        key2: 'value2',
        hasOwnProperty: sinon.stub(),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each key in the passed in object', function() {
      describe('if the object has that key property', function() {
        it('should call stateCompare.emit with the event \'stateCompare.childReadyForPrint\''
          +' passing in object[key], colorFunc, and key:', function() {
          delete sampleObject.hasOwnProperty;

          stateCompare._printObjectKeyValues(sampleObject, colorFunc);

          expect(stateCompare.emit.args).to.deep.equal([
            ['stateCompare.childReadyForPrint', 'value1', colorFunc, 'key1:'],
            ['stateCompare.childReadyForPrint', 'value2', colorFunc, 'key2:'],
          ]);
        });
      });
      describe('if the object does NOT have that key property', function() {
        it('should not call stateCompare.emit', function() {
          sampleObject.hasOwnProperty.returns(false);

          stateCompare._printObjectKeyValues(sampleObject, colorFunc);

          expect(stateCompare.emit.callCount).to.equal(0);
        });
      });
    });
  });

  describe('_printEndOfObject', function() {
    let Emitter;
    let stateCompare;
    let colorFunc;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      colorFunc = sinon.stub();
      colorFunc.returns('coloredString');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
      stateCompare._indent = sinon.stub();
      stateCompare._indent.returns('  ');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should decrement the indentcount once', function() {
      stateCompare._indentCount = 4;

      stateCompare._printEndOfObject(colorFunc);

      expect(stateCompare._indentCount).to.equal(3);
    });

    it('should call the passed in color func once with `},`', function() {
      stateCompare._indentCount = 8;

      stateCompare._printEndOfObject(colorFunc);

      expect(colorFunc.args).to.deep.equal([
        [`},`],
      ]);
    });

    it('should call stateCompare._indent once', function() {
      stateCompare._printEndOfObject(colorFunc);

      expect(stateCompare._indent.callCount).to.equal(1);
    });

    it('should concatenate ._compareResult with \'\\n  coloredString\'', function() {
      stateCompare._printEndOfObject(colorFunc);

      expect(stateCompare._compareResult).to.equal('\n  coloredString');
    });
  });

  describe('_indent', function() {
    let Emitter;
    let stateCompare;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if indent count equals 3', function() {
      it('should return a string with 6x \\u0020', function() {
        stateCompare._indentCount = 3;
        let result;

        result = stateCompare._indent();

        expect(result).to.equal('\u0020\u0020\u0020\u0020\u0020\u0020');
      });
    });

    describe('if indent count equals 1', function() {
      it('should return a string with 2x \\u0020', function() {
        stateCompare._indentCount = 1;
        let result;

        result = stateCompare._indent();

        expect(result).to.equal('\u0020\u0020');
      });
    });
  });

  describe('_printRed', function() {
    let Emitter;
    let stateCompare;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return a string that colors the string red then resets back to default', function() {
      let result;

      result = stateCompare._printRed('stringThatShouldBeRed');

      expect(result).to.equal('\x1b[31mstringThatShouldBeRed\x1b[0m');
    });
  });

  describe('_printGreen', function() {
    let Emitter;
    let stateCompare;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../../lib/runner/reporters/utils/state-compare.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});

      stateCompare = require('../../../../../../lib/runner/reporters/utils/state-compare.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return a string that colors the string green then resets back to default', function() {
      let result;

      result = stateCompare._printGreen('stringThatShouldBeGreen');

      expect(result).to.equal('\x1b[32mstringThatShouldBeGreen\x1b[0m');
    });
  });
});
