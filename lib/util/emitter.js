'use strict';

let EventEmitter = require('events').EventEmitter;

let Emitter;

module.exports = Emitter = {
    mixIn(myObject, parentEmitter) {
        Object.setPrototypeOf(myObject, new EventEmitter());

        myObject.runOn = Emitter.runOn;
        myObject.emit = Emitter.emit;
        myObject.emitAsync = Emitter.emitAsync;
        myObject._run = Emitter._run;
        myObject._parentEmitter = parentEmitter;
    },
    emit(...myAgruments) {
        Object.getPrototypeOf(this).emit(...myAgruments); // check if context is the same
        if (this._parentEmitter) {
            this._parentEmitter.emit(...myAgruments);
        }
    },
    emitAsync(...myAgruments) {
        process.nextTick(() => {
            Object.getPrototypeOf(this).emit(...myAgruments); // check if context is the same
            if (this._parentEmitter) {
                this._parentEmitter.emit(...myAgruments);
            }
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
