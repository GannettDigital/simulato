'use strict';

function CustomError(name, code, message) {
  let instance = new Error(message);
  instance.name = `${name} ${code}`;
  instance.code = code;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  Error.captureStackTrace(instance, CustomError);
  return instance;
}

CustomError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true,
  },
});

module.exports = CustomError;

