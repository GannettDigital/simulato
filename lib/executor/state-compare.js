'use strict';

const _ = require('lodash');
const Emitter = require('../util/emitter.js');

let stateCompare;

module.exports = stateCompare = {
  _indentCount: null,
  _compareResult: '',
  printDifference(pageState, expectedState) {
    stateCompare.emit('stateCompare.findDrifference', pageState, expectedState, function(difference) {
      stateCompare._compareResult += `\n${stateCompare._printRed(`-- Page State`)}`;
      stateCompare._compareResult += `\n${stateCompare._printGreen(`++ Expected State`)}`;
      stateCompare._indentCount = 0;
      stateCompare._compareResult += `\n{`;
      stateCompare._indentCount++;
      stateCompare.emit('stateCompare.readyToPrintKeys', difference, expectedState);
      stateCompare._compareResult += `\n}`;
      stateCompare.emit('stateCompare.differenceCreated', stateCompare._compareResult);
    });
  },
  _findDifference(object, base, callback) {
    function changes(object, base) {
      return _.transform(object, function(result, value, key) {
        if (!_.isEqual(value, base[key])) {
          result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }
    return callback(changes(object, base));
  },
  _printKeys(difference, base) {
    for (let key in difference) {
      if (difference.hasOwnProperty(key)) {
        stateCompare.emit('stateCompare.keyReadyToPrint', key, difference[key], base[key]);
      }
    }
  },
  _printKey(parentKey, differenceValue, baseValue) {
    let keyString = `${stateCompare._indent()}${parentKey}`;
    if (Array.isArray(differenceValue)) {
      stateCompare.emit('stateCompare.differenceValueFoundAsArray', differenceValue, baseValue, keyString);
    } else if (_.isObject(differenceValue)) {
      stateCompare.emit('stateCompare.differenceValueFoundAsObject', differenceValue, baseValue, keyString, parentKey);
    } else {
      if (typeof differenceValue === 'string') {
        differenceValue = `'${differenceValue}'`;
      }
      stateCompare._compareResult += `\n${stateCompare._printRed(`${keyString}: ${differenceValue},`)}`;
      if (!_.isObject(baseValue)) {
        if (typeof baseValue === 'string') {
          baseValue = `'${baseValue}'`;
        }
        stateCompare._compareResult += `\n${stateCompare._printGreen(`${keyString}: ${baseValue},`)}`;
      } else {
        stateCompare.emit('stateCompare.childReadyForPrint', baseValue, stateCompare._printGreen, keyString);
      }
    }
  },
  _handleDifferenceArrayValue(differenceValue, baseValue, keyString) {
    if (!Array.isArray(baseValue)) {
      stateCompare.emit('stateCompare.childReadyForPrint', differenceValue, stateCompare._printRed, keyString);
      if (_.isObject(baseValue)) {
        stateCompare.emit('stateCompare.childReadyForPrint', baseValue, stateCompare._printGreen, keyString);
      } else {
        if (typeof baseValue === 'string') {
          baseValue = `'${baseValue}'`;
        }
        stateCompare._compareResult += `\n${stateCompare._printGreen(`${keyString}: ${baseValue},`)}`;
      }
    } else {
      stateCompare._compareResult += `\n${keyString} [`;
      stateCompare._indentCount++;
      stateCompare.emit('stateCompare.readyToPrintKeys', differenceValue, baseValue);
      stateCompare._indentCount--;
      stateCompare._compareResult += `\n${stateCompare._indent()}],`;
    }
  },
  _handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey) {
    if (!_.isObject(baseValue)) {
      stateCompare.emit('stateCompare.childReadyForPrint', differenceValue, stateCompare._printRed, `${parentKey}`);
      if (typeof baseValue === 'string') {
        baseValue = `'${baseValue}'`;
      }
      stateCompare._compareResult += `\n${stateCompare._printGreen(`${keyString}: ${baseValue},`)}`;
    } else {
      stateCompare._compareResult += `\n${keyString}: {`;
      stateCompare._indentCount++;
      stateCompare.emit('stateCompare.readyToPrintKeys', differenceValue, baseValue);
      stateCompare._indentCount--;
      stateCompare._compareResult += `\n${stateCompare._indent()}},`;
    }
  },
  _printChild(child, colorFunc, baseString) {
    if (Array.isArray(child)) {
      stateCompare.emit('stateCompare.arrayReadyToStartPrint', baseString, colorFunc);
      stateCompare.emit('stateCompare.arrayReadyToPrint', child, colorFunc);
      stateCompare.emit('stateCompare.arrayReadyToEndPrint', colorFunc);
    } else if (_.isObject(child)) {
      stateCompare.emit('stateCompare.objectReadyToStartPrint', baseString, colorFunc);
      stateCompare.emit('stateCompare.objectReadyToPrint', child, colorFunc);
      stateCompare.emit('stateCompare.objectReadyToEndPrint', colorFunc);
    } else {
      if (typeof child === 'string') {
        child = `'${child}'`;
      }
      if (!baseString) {
        stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`${child},`)}`;
      } else {
        stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`${baseString} ${child},`)}`;
      }
    }
  },
  _printStartOfArray(string, colorFunc) {
    if (!string) {
      stateCompare._compareResult += `\n${colorFunc(`[`)}`;
    } else {
      stateCompare._compareResult += `\n${colorFunc(`${string}: [`)}`;
    }
    stateCompare._indentCount++;
  },
  _printArrayElements(array, colorFunc) {
    for (let i = 0; i < array.length; i++) {
      stateCompare.emit('stateCompare.childReadyForPrint', array[i], colorFunc);
    }
  },
  _printEndOfArray(colorFunc) {
    stateCompare._indentCount--;
    stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`],`)}`;
  },
  _printStartOfObject(key, colorFunc) {
    if (!key) {
      stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`{`)}`;
    } else {
      stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`${key}: {`)}`;
    }
    stateCompare._indentCount++;
  },
  _printObjectKeyValues(obj, colorFunc) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        stateCompare.emit('stateCompare.childReadyForPrint', obj[key], colorFunc, `${key}:`);
      }
    }
  },
  _printEndOfObject(colorFunc) {
    stateCompare._indentCount--;
    stateCompare._compareResult += `\n${stateCompare._indent()}${colorFunc(`},`)}`;
  },
  _indent() {
    let indent = '';
    for (let i = 0; i < stateCompare._indentCount; i++) {
      indent+= '\u0020\u0020';
    };
    return indent;
  },
  _printRed(string) {
    return `\x1b[31m${string}\x1b[0m`;
  },
  _printGreen(string) {
    return `\x1b[32m${string}\x1b[0m`;
  },
};

Emitter.mixIn(stateCompare, require('./executor-event-dispatch/executor-event-dispatch.js'));

stateCompare.on('stateCompare.findDrifference', stateCompare._findDifference);
stateCompare.on('stateCompare.readyToPrintKeys', stateCompare._printKeys);
stateCompare.on('stateCompare.keyReadyToPrint', stateCompare._printKey);
stateCompare.on('stateCompare.differenceValueFoundAsArray', stateCompare._handleDifferenceArrayValue);
stateCompare.on('stateCompare.differenceValueFoundAsObject', stateCompare._handleDifferenceObjectValue);
stateCompare.on('stateCompare.childReadyForPrint', stateCompare._printChild);
stateCompare.on('stateCompare.arrayReadyToStartPrint', stateCompare._printStartOfArray);
stateCompare.on('stateCompare.arrayReadyToPrint', stateCompare._printArrayElements);
stateCompare.on('stateCompare.arrayReadyToEndPrint', stateCompare._printEndOfArray);
stateCompare.on('stateCompare.objectReadyToStartPrint', stateCompare._printStartOfObject);
stateCompare.on('stateCompare.objectReadyToPrint', stateCompare._printObjectKeyValues);
stateCompare.on('stateCompare.objectReadyToEndPrint', stateCompare._printEndOfObject);
