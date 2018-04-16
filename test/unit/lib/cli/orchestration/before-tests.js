'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/orchestration/before.js', function() {
    describe('on file being required', function() {
        let before;
        let EventEmitter;
        let EventEmitterInstance;
        let concurrent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            concurrent = sinon.stub();

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('palinode', {concurrent});
            mockery.registerMock('../../util/saucelabs.js', {});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of before to a new EventEmitter', function() {
            before = require('../../../../../lib/cli/orchestration/before.js');

            expect(Object.getPrototypeOf(before)).to.deep.equal(EventEmitterInstance);
        });

        it(`should call before.on once passing in the event 'before.readyToRunFunctions` +
            ` and the function before._runFunctions`, function() {
            before = require('../../../../../lib/cli/orchestration/before.js');

            expect(before.on.args).to.deep.equal([[
                'before.readyToRunFunctions',
                before._runFunctions,
            ]]);
        });
    });

    describe('runScripts', function() {
        let before;
        let EventEmitter;
        let EventEmitterInstance;
        let Saucelabs;
        let functionToRequire;
        let concurrent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            Saucelabs = {
                connect: sinon.stub(),
            };

            concurrent = sinon.stub();
            process.env.SAUCE_LABS = 'true';
            process.env.BEFORE_SCRIPT = 'path/to/script';
            functionToRequire = sinon.stub();
            mockery.registerMock('path/to/script', functionToRequire);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('palinode', {concurrent});
            mockery.registerMock('../../util/saucelabs.js', Saucelabs);

            before = require('../../../../../lib/cli/orchestration/before.js');
        });

        afterEach(function() {
            delete process.env.BEFORE_SCRIPT;
            delete process.env.SAUCE_LABS;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('when process.env.BEFORE_SCRIPT is set', function() {
            it(`should call before.emit once with the event 'before.readyToRunFunctions' `
            + `an array containing the required sciprt, and the passed on configureInfo`, function() {
                delete process.env.SAUCE_LABS;

                before.runScripts({someConfig: 'aConfigValue'});

                expect(before.emit.args).to.deep.equal([
                    [
                        'before.readyToRunFunctions',
                        [functionToRequire],
                        {someConfig: 'aConfigValue'},
                    ],
                ]);
            });
        });

        describe('when process.env.BEFORE_SCRIPT is NOT set', function() {
            it(`should call before.emit once with the event 'before.readyToRunFunctions' `
                + `an empty array, and the passed on configureInfo`, function() {
                delete process.env.SAUCE_LABS;
                delete process.env.BEFORE_SCRIPT;

                before.runScripts({someConfig: 'aConfigValue'});

                expect(before.emit.args).to.deep.equal([
                    [
                        'before.readyToRunFunctions',
                        [],
                        {someConfig: 'aConfigValue'},
                    ],
                ]);
            });
        });

        describe('when process.env.SAUCE_LABS is set to true', function() {
            it('should call Saucelabs.connect once', function() {
                delete process.env.BEFORE_SCRIPT;

                before.runScripts({someConfig: 'aConfigValue'});

                expect(Saucelabs.connect.callCount).to.equal(1);
            });

            it('should call Saucelabs.connect passing in a callback function', function() {
                delete process.env.BEFORE_SCRIPT;

                before.runScripts({someConfig: 'aConfigValue'});

                expect(Saucelabs.connect.args[0][0]).to.be.a('function');
            });

            describe('when the callback function is called', function() {
                describe('if an error was returned', function() {
                    it('should throw the error', function() {
                        delete process.env.BEFORE_SCRIPT;
                        Saucelabs.connect.callsArgWith(0, new Error('Threw an error'));
                        let errMessage;

                        try {
                            before.runScripts({someConfig: 'aConfigValue'});
                        } catch (error) {
                            errMessage = error.message;
                        }

                        expect(errMessage).to.equal('Threw an error');
                    });
                });
                describe('if no error was returned', function() {
                    it(`should call before.emit once with the event 'before.readyToRunFunctions' `
                        + `an empty array, and the passed on configureInfo`, function() {
                        delete process.env.BEFORE_SCRIPT;
                        Saucelabs.connect.callsArgWith(0, null);

                        before.runScripts({someConfig: 'aConfigValue'});

                        expect(before.emit.args).to.deep.equal([
                            [
                                'before.readyToRunFunctions',
                                [],
                                {someConfig: 'aConfigValue'},
                            ],
                        ]);
                    });
                });
            });
        });

        describe('when both process.env.BEFORE_SCRIPT and process.env.SAUCE_LABS are set', function() {
            it('should call Saucelabs.connect once', function() {
                before.runScripts({someConfig: 'aConfigValue'});

                expect(Saucelabs.connect.callCount).to.equal(1);
            });

            it('should call Saucelabs.connect passing in a callback function', function() {
                before.runScripts({someConfig: 'aConfigValue'});

                expect(Saucelabs.connect.args[0][0]).to.be.a('function');
            });

            describe('when the callback function is called', function() {
                describe('if an error was returned', function() {
                    it('should throw the error', function() {
                        Saucelabs.connect.callsArgWith(0, new Error('Threw an error'));
                        let errMessage;

                        try {
                            before.runScripts({someConfig: 'aConfigValue'});
                        } catch (error) {
                            errMessage = error.message;
                        }

                        expect(errMessage).to.equal('Threw an error');
                    });
                });
                describe('if no error was returned', function() {
                    it(`should call before.emit once with the event 'before.readyToRunFunctions' `
                        + `an array containing the required sciprt, and the passed on configureInfo`, function() {
                        Saucelabs.connect.callsArgWith(0, null);

                        before.runScripts({someConfig: 'aConfigValue'});

                        expect(before.emit.args).to.deep.equal([
                            [
                                'before.readyToRunFunctions',
                                [functionToRequire],
                                {someConfig: 'aConfigValue'},
                            ],
                        ]);
                    });
                });
            });
        });
    });

    describe('_runFunctions', function() {
        let before;
        let EventEmitter;
        let EventEmitterInstance;
        let Saucelabs;
        let functionToRequire;
        let concurrent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            Saucelabs = {
                connect: sinon.stub(),
            };

            concurrent = sinon.stub();
            process.env.SAUCE_LABS = 'true';
            process.env.BEFORE_SCRIPT = 'path/to/script';
            functionToRequire = sinon.stub();
            mockery.registerMock('path/to/script', functionToRequire);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('palinode', {concurrent});
            mockery.registerMock('../../util/saucelabs.js', Saucelabs);

            before = require('../../../../../lib/cli/orchestration/before.js');
        });

        afterEach(function() {
            delete process.env.BEFORE_SCRIPT;
            delete process.env.SAUCE_LABS;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call concurrent once', function() {
            before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

            expect(concurrent.callCount).to.equal(1);
        });

        it('should call concurrent with the passed in functions as the first param', function() {
            before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

            expect(concurrent.args[0][0]).to.deep.equal([functionToRequire]);
        });

        it('should call concurrent with a callback as the second param', function() {
            before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

            expect(concurrent.args[0][1]).to.deep.be.a('function');
        });

        describe('when the callback function is called', function() {
            describe('if an error is returned', function() {
                it('should throw the error', function() {
                    concurrent.callsArgWith(1, new Error('Threw an error'));
                    let errMessage;

                    try {
                        before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});
                    } catch (error) {
                        errMessage = error.message;
                    }

                    expect(errMessage).to.equal('Threw an error');
                });
            });

            describe('if an error is NOT returned', function() {
                it(`should call before.emit once with the event 'before.finished' `
                    + `and the passed on configureInfo`, function() {
                    concurrent.callsArgWith(1, null);

                    before._runFunctions([], {someConfig: 'aConfigValue'});

                    expect(before.emit.args).to.deep.equal([
                        [
                            'before.finished',
                            {someConfig: 'aConfigValue'},
                        ],
                    ]);
                });
            });
        });
    });
});
