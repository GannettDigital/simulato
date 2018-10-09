'use strict';

const portscanner = require('portscanner');
const configHandler = require('../../util/config/config-handler.js');

let debugPortHandler;
module.exports = debugPortHandler = {
  _startPort: null,
  _currentPort: null,
  _maxPort: 65535,
  _portsToGet: [],
  _currentlyGettingPort: false,
  getPort(callback) {
    debugPortHandler._portsToGet.push(callback);

    if (!debugPortHandler._startPort) {
      if (configHandler.get('debugPort')) {
        debugPortHandler._currentPort = debugPortHandler._startPort = parseInt(configHandler.get('debugPort'));
      } else {
        debugPortHandler._currentPort = debugPortHandler._startPort = 32489;
      }
    }

    if (!debugPortHandler._currentlyGettingPort) {
      debugPortHandler._currentlyGettingPort = true;
      debugPortHandler._findPort();
    }
  },
  _findPort() {
    let callback = debugPortHandler._portsToGet.shift();
    portscanner.findAPortNotInUse(
        debugPortHandler._currentPort,
        debugPortHandler._maxPort,
        '127.0.0.1',
        function(error, port) {
          if (error) {
            throw new SimulatoError.RUNNER.CHILD_SPAWN_ERROR(
                `Error while finding debug port for child process: ${error.message}`
            );
          }
        port === 65535
          ? debugPortHandler._currentPort = debugPortHandler._startPort
          : debugPortHandler._currentPort = port + 1;
        debugPortHandler._sendPort(port, callback);
        if (debugPortHandler._portsToGet.length) {
          debugPortHandler._findPort();
        } else {
          debugPortHandler._currentlyGettingPort = false;
        }
        }
    );
  },
  _sendPort(port, callback) {
    callback(port);
  },
};
