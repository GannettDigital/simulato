'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/generate.js', function() {
    describe('On file being required', function() {
        let generate;
        let EventEmitter;
        let EventEmitterInstance;
        let path;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            path = {
                resolve: sinon.stub(),
                normalize: sinon.stub().returns('../../../../config.js'),
            };

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('path', path);
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
        let path;
        let configFile;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});

            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            sinon.spy(process, 'cwd');

            configFile = {
                testPath: 'sanity_tests',
                components: './test/acceptance/components',
                reportPath: 'sanity_tests',
                outputPath: 'sanity_tests',
                actionToCover: 'testAction',
                technique: 'actionFocused',
            };

            path = {
                resolve: sinon.stub(),
                normalize: sinon.stub().returns('../../../../config.js'),
            };

            global.MbttError = {
                CLI: {
                    INVALID_COMPONENT_PATH: sinon.stub(),
                    INVALID_GENERATION_TECHNIQUE: sinon.stub(),
                },
            };

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('path', path);
            generate = require('../../../../../lib/cli/commands/generate.js');
        });

        afterEach(function() {
            delete process.env.PLANNER_OUTPUT_PATH;
            process.cwd.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        describe('Config file is loaded from passed location', function() {
            it('should emit the components', function() {
                let pathLoc = '../../../../config.js';
                let options = {configFile: pathLoc};
                configFile.components = 'PassedComponents';
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[0]).to.deep.equal(['generate.loadComponents', configFile.components]);
            });
            it('should throw an error if the component path is invalid', function() {
                let pathLoc = '../../../../config.js';
                let message = 'No components were found at path';
                let options = {
                    configFile: pathLoc,
                    components: false,
                };
                configFile.components = false;
                mockery.registerMock(pathLoc, configFile);
                MbttError.CLI.INVALID_COMPONENT_PATH.throws({message});

                expect(generate.configure.bind(null, options)).to.throw(message);
            });
            it('should call path.normalize once with result of process.cwd and the path location', function() {
                let pathLoc = '../../../../config.js';
                let options = {configFile: pathLoc};
                configFile.components = 'PassedComponents';
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(path.normalize.args).to.deep.equal([
                    [`${process.cwd()}/${pathLoc}`],
                ]);
            });
        });
        describe('Config file is loaded from default location', function() {
            it('should emit the components', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[0]).to.deep.equal(['generate.loadComponents', configFile.components]);
            });
            it('should throw an error if the component path is invalid', function() {
                let pathLoc = '../../../../config.js';
                let message = 'No components were found at path';
                let options = {
                    components: false,
                };
                configFile.components = false;
                mockery.registerMock(pathLoc, configFile);
                MbttError.CLI.INVALID_COMPONENT_PATH.throws({message});

                expect(generate.configure.bind(null, options)).to.throw(message);
            });
        });
        describe('Components are loaded from options.components', function() {
            it('should emit the event for loading components with the path to the components', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    components: 'differentPath',
                };
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[0]).to.deep.equal(['generate.loadComponents', 'differentPath']);
            });
        });
        describe('Components are loaded from configFile.components', function() {
            it('should emit the event for loading components with the path to the components', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[0]).to.deep.equal(['generate.loadComponents',
                        './test/acceptance/components']);
            });
            it('should throw an error if the component path is invalid', function() {
                let pathLoc = '../../../../config.js';
                let message = 'No components were found at path';
                let options = {
                    configFile: pathLoc,
                };
                configFile.components = false;
                mockery.registerMock(pathLoc, configFile);
                MbttError.CLI.INVALID_COMPONENT_PATH.throws({message});

                expect(generate.configure.bind(null, options)).to.throw(message);
            });
        });
        describe('OutputPath is loaded from options.outputPath', function() {
            it('should call path.resolve once if the output path is set in the options', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    outputPath: 'output',
                };
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(path.resolve.args).to.deep.equal([['output']]);
            });
        });
        describe('OutputPath is loaded from configFile.OutputPath', function() {
            it('should call path.resolve once if the output path is set in the configfile', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(path.resolve.callCount).to.equal(1);
            });
            it('should call process.cwd twice if the output path is not set in the configfile', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.outputPath = false;
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(process.cwd.callCount).to.equal(2);
            });
        });
        describe('Action to cover is passed by options.actionToCover', function() {
            it('should assign action to cover to the configure info', function() {
                let pathLoc = '../../../../config.js';
                let options = {'actionToCover': 'testAction'};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'actionToCover': 'testAction', 'technique': 'actionFocused'}]);
            });
        });
        describe('Action to cover is passed by configFile.actionToCover', function() {
            it('should assign action to cover to the configure info', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'actionToCover': 'testAction', 'technique': 'actionFocused'}]);
            });
            it('should not assign an action to cover', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);
                configFile.actionToCover = false;

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'technique': 'actionFocused'}]);
            });
        });
        describe('Technique is passed by options.technique', function() {
            it('should set the config info technique to actionfocused', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    technique: 'actionFocused',
                };
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'actionToCover': 'testAction', 'technique': 'actionFocused'}]);
            });
        });
        describe('Technique is passed by configFile.technique', function() {
            it('should set the config info technique to actionfocused', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'actionToCover': 'testAction', 'technique': 'actionFocused'}]);
            });
            it('should throw an error if technique is not action focused', function() {
                let pathLoc = '../../../../config.js';
                let message = 'invalid generation technique';
                let options = {};
                MbttError.CLI.INVALID_GENERATION_TECHNIQUE.throws({message});
                configFile.technique = 'wrongAction';
                mockery.registerMock(pathLoc, configFile);

                expect(generate.configure.bind(null, options)).to.throw(message);
            });
        });
        it('should emit configureInfo file is fully traversed', function() {
            let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                generate.configure(options);

                expect(generate.emit.args[1]).to.deep.equal(
                    ['generate.configured', {'actionToCover': 'testAction', 'technique': 'actionFocused'}]);
        });
    });
});
