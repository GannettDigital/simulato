'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

let searchNode;
module.exports = searchNode = {
    create(actions, callback) {
        let myNode = Object.create(searchNode);

        searchNode.emit('searchNode.createDataStore', function(dataStore) {
            myNode.dataStore = dataStore;

            searchNode.emit('searchNode.createExpectedState', myNode.dataStore, function(expectedState) {
                myNode.state = expectedState;
                myNode.path = [];
                myNode.actions = actions;
                myNode.testCase = [];
                myNode.lastAction = null;

                callback(null, myNode);
            });
        });
    },
    clone(node, callback) {
        node.create(new Set(node.actions.values()), function(error, newNode) {
            newNode.dataStore = node.dataStore.clone();
            node.state.clone(newNode.dataStore, function(clone) {
                newNode.state = clone;
                newNode.path = [...node.path];
                newNode.testCase = _.cloneDeep(node.testCase);
                newNode.lastAction = node.lastAction;

                callback(null, newNode);
            });
        });
    },
};

Object.setPrototypeOf(searchNode, new EventEmitter());
