'use strict';

let EventEmitter = require('events').EventEmitter;

let Emitter;

module.exports = Emitter = {
    mixIn(myObject) {
        Object.setPrototypeOf(myObject, new EventEmitter());

        myObject.runOn = Emitter.runOn;
        myObject.emitAsync = Emitter.emitAsync;
        myObject._run = Emitter._run;
    },
    emitAsync() {
        let args = [...arguments];
        process.nextTick(() => {
            this.emit(...args);
        });
    },
    runOn(event, myFunction) {
        this.on(event, () => {
            this._run(myFunction, [...arguments]);
        });
    },
    _run(myFunction, args) {
        let generatorObject = myFunction(...args);

        generatorObject.next();

        function nextFunction(error, result) {
            if (error) {
                generatorObject.throw(error);
            } else {
                generatorObject.next(result);
            }
        }

        generatorObject.next(nextFunction);
    },
};
