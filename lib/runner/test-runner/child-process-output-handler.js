'use strict';

const EventEmitter = require('events').EventEmitter;

let childProcessOutputHandler;
module.exports = childProcessOutputHandler = {
  _data: {
    stdoutArray: [],
    stderrArray: [],
  },
  addNewChildOutput(testNumber) {
    childProcessOutputHandler._data.stdoutArray[testNumber] = '';
    childProcessOutputHandler._data.stderrArray[testNumber] = '';
  },
  appendStdout(data, testNumber) {
    childProcessOutputHandler._data.stdoutArray[testNumber] += data;
  },
  appendStderr(data, testNumber) {
    childProcessOutputHandler._data.stderrArray[testNumber] += data;
  },
  finalizeChildOutput() {
    childProcessOutputHandler.emit('childProcessOutputHandler.childOutputFinalized', childProcessOutputHandler._data);
  },
};

Object.setPrototypeOf(childProcessOutputHandler, new EventEmitter());
