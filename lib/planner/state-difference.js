'use strict';

let stateDiff;

// Code from
// https://stackoverflow.com/questions/33232823/how-to-compare-two-objects-and-get-key-value-pairs-of-their-differences
module.exports = stateDiff = {
  createDiff(oldState = {}, newState = {}, callback) {
    // Only need the new stuff
    return callback(null,
        stateDiff._diff(newState, oldState, 'newState'),
    );
  },
  _isObject(x) {
    return (Object(x) === x);
  },
  _isArray(x) {
    return (Array.isArray(x));
  },
  _mutation(obj, [key, value]) {
    return (obj[key] = value, obj);
  },
  _diff(oldState = {}, newState = {}, relation = 'newState') {
    return Object.entries(oldState)
        .map(function([key, value]) {
          return stateDiff._isObject(value) && stateDiff._isObject(newState[key]) ?
          [key, stateDiff._diff(value, newState[key], relation)] :
          newState[key] !== value ?
            [key, {[relation]: value}] :
            [key, {}];
        })
        .filter(function([key, value]) {
          return Object.keys(value).length !== 0;
        })
        .reduce(
            stateDiff._mutation,
        stateDiff._isArray(oldState) && stateDiff._isArray(newState) ? [] : {},
        );
  },
  _merge(oldState = {}, newState = {}) {
    return Object.entries(newState)
        .map(function([key, value]) {
          return stateDiff._isObject(value) && stateDiff._isObject(oldState[key]) ?
          [key, stateDiff._merge(oldState [key], value)] :
          [key, value];
        })
        .reduce(stateDiff._mutation, oldState);
  },
};
