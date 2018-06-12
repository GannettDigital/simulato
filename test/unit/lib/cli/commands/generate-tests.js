'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/generate.js', function() {
    describe('On file being required', function() {
        let generate;
        let EventEmitter;
        let EventEmitterInstance;
        let configHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            configHandler = {
                createConfig: sinon.stub(),
            };

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', configHandler);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should set the object prototype of generate to a new EventEmitter', function() {
            generate = require('../../../../../lib/cli/commands/generate.js');

            expect(Object.getPrototypeOf(generate)).to.deep.equal(EventEmitterInstance);
        });
    });

    describe('configure', function() {
        let generate;
        let EventEmitter;
        let EventEmitterInstance;
        let configHandler;
        let config;
        let options;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});

            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            config = {
                componentPath: './test/acceptance/components',
                outputPath: './test/outputPath',
                technique: 'actionFocused',
            };

            options = {
                opts: sinon.stub().returns({opt1: 'some option'}),
            };

            configHandler = {
                createConfig: sinon.stub(),
            };

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', configHandler);
            generate = require('../../../../../lib/cli/commands/generate.js');
        });

        afterEach(function() {
            delete process.env.PLANNER_OUTPUT_PATH;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the passed in options.opts method once with no params', function() {
            generate.configure(options);

            expect(options.opts.args).to.deep.equal([[]]);
        });

        it('should call configHandler.createConfig once', function() {
            generate.configure(options);

            expect(configHandler.createConfig.callCount).to.equal(1);
        });

        it('should call configHandler.createConfig with ' +
            'the first param as the returned object from options.opts', function() {
            generate.configure(options);

            expect(configHandler.createConfig.args[0][0]).to.deep.equal({opt1: 'some option'});
        });

        it('should call configHandler.createConfig with ' +
            'the second param as a function', function() {
            generate.configure(options);

            expect(configHandler.createConfig.args[0][1]).to.be.a('function');
        });

        describe('when the configHandler.createConfig callback is called', function() {
            it('should call generate.emit with \'generate.loadComponents\', ' +
                'and the returned config.compoentPath', function() {
                configHandler.createConfig.callsArgWith(1, config);

                generate.configure(options);

                expect(generate.emit.args[0]).to.deep.equal([
                    'generate.loadComponents',
                    config.componentPath,
                ]);
            });

            it('should set process.env.PLANNER_OUTPUT_PATH to the returned config.outputPath', function() {
                configHandler.createConfig.callsArgWith(1, config);

                generate.configure(options);

                expect(process.env.PLANNER_OUTPUT_PATH).to.equal(config.outputPath);
            });

            describe('if config.actionToCover is truthy', function() {
                it('should call generate.emit with \'generate.configured\', ' +
                    'and an object containing config.actionToCover & config.technique', function() {
                    config.actionToCover = 'testAction';
                    configHandler.createConfig.callsArgWith(1, config);

                    generate.configure(options);

                    expect(generate.emit.args[1]).to.deep.equal([
                        'generate.configured',
                        {
                            actionToCover: 'testAction',
                            technique: config.technique,
                        },
                    ]);
                });
            });

            it('should call generate.emit with \'generate.configured\', ' +
                'and an object containing config.technique', function() {
                configHandler.createConfig.callsArgWith(1, config);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal([
                    'generate.configured',
                    {
                        technique: config.technique,
                    },
                ]);
            });

            it('should call generate.emit twice', function() {
                configHandler.createConfig.callsArgWith(1, config);

                generate.configure(options);

                expect(generate.emit.callCount).to.equal(2);
            });
        });
    });
});
