'use strict';

const Emitter = require('../../util/emitter.js');
const globalEventDispatch = require('../../global-event-dispatch/global-event-dispatch.js');
let dispatch = {};

Emitter.mixIn(dispatch, globalEventDispatch);

module.exports = dispatch;
