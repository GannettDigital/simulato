'use strict';

const Emitter = require('../util/emitter.js');

let dispatch = {};

Emitter.mixIn(dispatch);

module.exports = dispatch;
