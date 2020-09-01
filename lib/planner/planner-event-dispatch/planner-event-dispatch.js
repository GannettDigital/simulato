'use strict';

const Emitter = require('../../util/emitter.js');
const globalEventDispatch = require('../../global-event-dispatch/global-event-dispatch.js');
const dispatch = {};

Emitter.mixIn(dispatch, globalEventDispatch);

module.exports = dispatch;
