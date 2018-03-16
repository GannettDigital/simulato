'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

let searchNode;
module.exports = searchNode = {
    create(actions, callback) {
        let myNode = Object.create(searchNode);

        searchNode.emit('searchNode.createExpectedState', function(expectedState) {
            myNode.state = expectedState;
            myNode.path = new Set();
            myNode.actions = actions;
            myNode.testCase = [];

            callback(null, myNode);
        });
    },
    clone(node, callback) {
        node.create(new Set(node.actions.values()), function(error, newNode) {
            node.state.clone(function(clone) {
                newNode.state = clone;
                newNode.path = new Set(node.path.values());
                newNode.testCase = _.cloneDeep(node.testCase);
                callback(null, newNode);
            });
        });
    },
};

Object.setPrototypeOf(searchNode, new EventEmitter());
