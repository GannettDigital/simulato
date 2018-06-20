'use strict';

const Emitter = require('../util/emitter.js');
const _ = require('lodash');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let searchNode;
module.exports = searchNode = {
    create(actions, callback) {
        let myNode = Object.create(searchNode);

        searchNode.emit('dataStore.create', function(dataStore) {
            myNode.dataStore = dataStore;

            searchNode.emit('expectedState.create', myNode.dataStore, function(expectedState) {
                myNode.state = expectedState;
                myNode.path = [];
                myNode.actions = actions;
                myNode.testCase = [];
                myNode.lastAction = null;
                myNode.allActions = new Set();

                callback(null, myNode);
            });
        });
    },
    clone(node, callback) {
        node.create(new Set(node.actions.values()), function(error, newNode) {
            newNode.dataStore = node.dataStore.clone();
            node.state.clone(newNode.dataStore, function(cloneState) {
                newNode.state = cloneState;
                newNode.path = [...node.path];
                newNode.testCase = _.cloneDeep(node.testCase);
                newNode.lastAction = node.lastAction;
                newNode.allActions = new Set(node.allActions.values());

                callback(null, newNode);
            });
        });
    },
};

Emitter.mixIn(searchNode, plannerEventDispatch);
