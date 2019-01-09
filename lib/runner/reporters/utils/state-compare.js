'use strict';

const _ = require('lodash');
let stateCompare;

module.exports = stateCompare = {
  _indentCount: null,
  _compareResult: '',
  printDifference(pageState, expectedState, callback) {
    stateCompare._findDifference(pageState, expectedState, function(difference) {
      stateCompare._compareResult += `\n${stateCompare._printRed(`    Page State`)}`;
      stateCompare._compareResult += `\n${stateCompare._printGreen(`    Expected State`)}`;
      stateCompare._indentCount = 1;
      stateCompare._compareResult += `\n  {`;
      stateCompare._indentCount++;
      stateCompare._printKeys(difference, expectedState);
      stateCompare._compareResult += `\n  }`;
      return callback(stateCompare._compareResult);
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
        stateCompare._printKey(key, difference[key], base[key]);
      }
    }
  },
  _printKey(parentKey, differenceValue, baseValue) {
    let keyString = `${stateCompare._indent()}${parentKey}`;
    if (Array.isArray(differenceValue)) {
      stateCompare._handleDifferenceArrayValue(differenceValue, baseValue, keyString);
    } else if (_.isObject(differenceValue)) {
      stateCompare._handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey);
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
        stateCompare._printChild(baseValue, stateCompare._printGreen, keyString);
      }
    }
  },
  _handleDifferenceArrayValue(differenceValue, baseValue, keyString) {
    if (!Array.isArray(baseValue)) {
      stateCompare._printChild(differenceValue, stateCompare._printRed, keyString);
      if (_.isObject(baseValue)) {
        stateCompare._printChild(baseValue, stateCompare._printGreen, keyString);
      } else {
        if (typeof baseValue === 'string') {
          baseValue = `'${baseValue}'`;
        }
        stateCompare._compareResult += `\n${stateCompare._printGreen(`${keyString}: ${baseValue},`)}`;
      }
    } else {
      stateCompare._compareResult += `\n${keyString} [`;
      stateCompare._indentCount++;
      stateCompare._printKeys(differenceValue, baseValue);
      stateCompare._indentCount--;
      stateCompare._compareResult += `\n${stateCompare._indent()}],`;
    }
  },
  _handleDifferenceObjectValue(differenceValue, baseValue, keyString, parentKey) {
    if (!_.isObject(baseValue)) {
      stateCompare._printChild(differenceValue, stateCompare._printRed, `${parentKey}`);
      if (typeof baseValue === 'string') {
        baseValue = `'${baseValue}'`;
      }
      stateCompare._compareResult += `\n${stateCompare._printGreen(`${keyString}: ${baseValue},`)}`;
    } else {
      stateCompare._compareResult += `\n${keyString}: {`;
      stateCompare._indentCount++;
      stateCompare._printKeys(differenceValue, baseValue);
      stateCompare._indentCount--;
      stateCompare._compareResult += `\n${stateCompare._indent()}},`;
    }
  },
  _printChild(child, colorFunc, baseString) {
    if (Array.isArray(child)) {
      stateCompare._printStartOfArray(baseString, colorFunc);
      stateCompare._printArrayElements(child, colorFunc);
      stateCompare._printEndOfArray(colorFunc);
    } else if (_.isObject(child)) {
      stateCompare._printStartOfObject(baseString, colorFunc);
      stateCompare._printObjectKeyValue(child, colorFunc);
      stateCompare._printEndOfObject(colorFunc);
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
      stateCompare._printChild(array[i], colorFunc);
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
        stateCompare._printChild(obj[key], colorFunc, `${key}:`);
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
    return `\x1b[31m--${string.substring(2)}\x1b[0m`;
  },
  _printGreen(string) {
    return `\x1b[32m++${string.substring(2)}\x1b[0m`;
  },
};
