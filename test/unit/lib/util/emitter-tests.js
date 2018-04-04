'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/emitter.js', function() {
    describe('mixIn', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let Emitter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/emitter.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
              emit: sinon.stub(),
              on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            Emitter = require('../../../../lib/util/emitter.js');

            Emitter.runOn = sinon.stub();
            Emitter.emitAsyn = sinon.stub();
            Emitter._run = sinon.stub();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the prototype of the passed in myObject to a new EventEmitter', function() {
            let myObject = {};

            Emitter.mixIn(myObject);

            expect(Object.getPrototypeOf(myObject)).to.deep.equal(EventEmitterInstance);
        });

        it('should set the passed in myObject.runOn to Emitter.runOn', function() {
            let myObject = {};

            Emitter.mixIn(myObject);

            expect(myObject.runOn).to.deep.equal(Emitter.runOn);
        });

        it('should set the passed in myObject.emitAsync to Emitter.emitAsync', function() {
            let myObject = {};

            Emitter.mixIn(myObject);

            expect(myObject.emitAsync).to.deep.equal(Emitter.emitAsync);
        });

        it('should set the passed in myObject._run to Emitter._run', function() {
            let myObject = {};

            Emitter.mixIn(myObject);

            expect(myObject._run).to.deep.equal(Emitter._run);
        });
    });

    describe('emitAsync', function() {
        let clock;
        let myThis;
        let Emitter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/emitter.js');

            clock = sinon.useFakeTimers({
                toFake: ['nextTick'],
            });
            myThis = {
                emit: sinon.stub(),
            };

            mockery.registerMock('events', {});

            Emitter = require('../../../../lib/util/emitter.js');
        });

        afterEach(function() {
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.emit once with function arguments on the next tick', function() {
            Emitter.emitAsync.call(myThis, 'param1', 'param2');

            clock.tick();

            expect(myThis.emit.args).to.deep.equal([
                [
                    'param1',
                    'param2',
                ],
            ]);
        });
    });

    describe('runOn', function() {
        let myThis;
        let Emitter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/emitter.js');

            myThis = {
                _run: sinon.stub(),
                on: sinon.stub(),
            };

            mockery.registerMock('events', {});

            Emitter = require('../../../../lib/util/emitter.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.on once', function() {
            Emitter.runOn.call(myThis, 'myEvent');

            expect(myThis.on.callCount).to.equal(1);
        });

        it('should call this.on with the passed in event as the first parameter', function() {
            Emitter.runOn.call(myThis, 'myEvent');

            expect(myThis.on.args[0][0]).to.equal('myEvent');
        });

        describe('when the this.on callback is called', function() {
            it('should call this._run with the passed in function and the arguments to the callback', function() {
                let myFunction = sinon.stub();
                Emitter.runOn.call(myThis, 'myEvent', myFunction);
                let onCallback = myThis.on.args[0][1];

                onCallback('param1', 'param2');

                expect(myThis._run.args).to.deep.equal([
                    [
                        myFunction,
                        [
                            'param1',
                            'param2',
                        ],
                    ],
                ]);
            });
        });
    });

    describe('_run', function() {
        let Emitter;
        let myFunction;
        let generatorObject;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/emitter.js');

            generatorObject = {
                next: sinon.stub(),
                throw: sinon.stub(),
            };
            myFunction = sinon.stub().returns(generatorObject);

            mockery.registerMock('events', {});

            Emitter = require('../../../../lib/util/emitter.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the passed in myFunction once with the spread passed in argurments', function() {
            Emitter._run(myFunction, ['param1', 'param2']);

            expect(myFunction.args).to.deep.equal([
                [
                    'param1',
                    'param2',
                ],
            ]);
        });

        it('should call generatorObject.next twice', function() {
            Emitter._run(myFunction, ['param1', 'param2']);

            expect(generatorObject.next.callCount).to.equal(2);
        });

        describe('when the nextFunction passed in to generatorObject.next is called', function() {
            describe('if an error is passed in', function() {
                it('should call generatorObject.throw once with the passed in error', function() {
                    let error = new Error('An Error Occurred!');
                    Emitter._run(myFunction, ['param1', 'param2']);
                    let nextFunction = generatorObject.next.args[1][0];

                    nextFunction(error);

                    expect(generatorObject.throw.args).to.deep.equal([
                        [
                            error,
                        ],
                    ]);
                });
            });

            describe('if an error is not passed in', function() {
                it('should call generatorObject.next with the passed in result', function() {
                    Emitter._run(myFunction, ['param1', 'param2']);
                    let nextFunction = generatorObject.next.args[1][0];

                    nextFunction(null, 'myResult');

                    expect(generatorObject.next.args[2]).to.deep.equal(['myResult']);
                });
            });
        });
    });
});
