'use strict';

const Emitter = require('../../util/emitter.js');

let dispatch = {};

Emitter.mixIn(dispatch, require('../../global-event-dispatch/global-event-dispatch.js'));

module.exports = dispatch;
