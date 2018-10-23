'use strict';

module.exports = {
  JSON: require('./write-json-to-disk.js'),
  actionJSON: require('./action-json-writer.js').write,
  JUnit: require('./j-unit-writer.js').write,
};
