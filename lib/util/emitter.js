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
    emitAsync(...myAgruments) {
        process.nextTick(() => {
            this.emit(...myAgruments);
        });
    },
    runOn(event, myFunction) {
        this.on(event, (...myAgruments) => {
            this._run(myFunction, [...myAgruments]);
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
