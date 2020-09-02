'use strict';

const Emitter = require('../util/emitter.js');

const dispatch = {};

Emitter.mixIn(dispatch);

module.exports = dispatch;
