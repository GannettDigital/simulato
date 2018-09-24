'use strict';

const _ = require('lodash');

let DataStore;

module.exports = DataStore = {
  create(callback) {
    let dataStore = Object.create(DataStore);
    dataStore._data = {};
    return callback(dataStore);
  },
  clone() {
    let clonedDataStore;
    this.create((dataStore) => {
      clonedDataStore = dataStore;
      clonedDataStore._data = _.cloneDeep(this._data);
    });
    return clonedDataStore;
  },
  store(key, value) {
    this._data[key] = _.cloneDeep(value);
  },
  retrieve(key) {
    return this._data[key];
  },
  delete(key) {
    delete this._data[key];
  },
  retrieveAndDelete(key, callback) {
    let temp = this._data[key];
    delete this._data[key];
    return temp;
  },
  retrieveAll() {
    return this._data;
  },
  has(key) {
    return this._data.hasOwnProperty(key);
  },
};
