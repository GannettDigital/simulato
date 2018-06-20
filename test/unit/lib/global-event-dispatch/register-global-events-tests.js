'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/global-event-dispatch/register-global-events.js', function() {
    let runnerEventDispatch;
    let plannerEventDispatch;
    let executeEventDispatch;
    let cliEventDispatch;
    let componentHandler;
    let pageStateHandler;
    let expectedState;
    let findFiles;
    let oracle;
    let validators;
    let dataStore;
    let registerGlobalEvents;
    let commands;
    let globalEventDispatch;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../lib/global-event-dispatch/register-global-events.js');

        runnerEventDispatch = {
            emit: sinon.stub(),
        };
        plannerEventDispatch = {
            emit: sinon.stub(),
        };
        executeEventDispatch = {
            emit: sinon.stub(),
        };
        cliEventDispatch = {
            emit: sinon.stub(),
        };
        componentHandler = {
            configure: sinon.stub(),
            getComponent: sinon.stub(),
            getComponents: sinon.stub(),
            getComponentActions: sinon.stub(),
        };
        pageStateHandler = {
            getPageState: sinon.stub(),
        };
        expectedState = {
            on: sinon.stub(),
            create: sinon.stub(),
        };
        findFiles = {
            search: sinon.stub(),
        };
        oracle = {
            runAssertions: sinon.stub(),
            deepEqual: sinon.stub(),
        };
        validators = {
            validateTestCases: sinon.stub(),
            validateComponents: sinon.stub(),
            validateElements: sinon.stub(),
            validateModel: sinon.stub(),
            validateEvents: sinon.stub(),
            validateChildren: sinon.stub(),
            validateActions: sinon.stub(),
            validateConfig: sinon.stub(),
        };
        dataStore = {
            create: sinon.stub(),
        };
        commands = {
            run: sinon.stub(),
            generate: sinon.stub(),
        };
        globalEventDispatch = {
            on: sinon.stub(),
        };

        mockery.registerMock('../runner/runner-event-dispatch/runner-event-dispatch.js', runnerEventDispatch);
        mockery.registerMock('../planner/planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
        mockery.registerMock('../executor/executor-event-dispatch/executor-event-dispatch.js', executeEventDispatch);
        mockery.registerMock('../cli/cli-event-dispatch/cli-event-dispatch.js', cliEventDispatch);
        mockery.registerMock('../util/component-handler.js', componentHandler);
        mockery.registerMock('../util/page-state-handler.js', pageStateHandler);
        mockery.registerMock('../util/expected-state.js', expectedState);
        mockery.registerMock('../util/find-files.js', findFiles);
        mockery.registerMock('../util/oracle.js', oracle);
        mockery.registerMock('../util/validators', validators);
        mockery.registerMock('../util/data-store.js', dataStore);
        mockery.registerMock('../cli/commands', commands);

        registerGlobalEvents = require('../../../../lib/global-event-dispatch/register-global-events.js');
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should call globalEventDispatch.on 22 times', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.callCount).to.equal(22);
    });

    it('should call globalEventDispatch.on with the event \'generate.configured\'', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[0][0]).to.equal('generate.configured');
    });

    describe('when the callback of globalEventDispatch.on with the event ' +
        '\'generate.configured\' is called', function() {
            it('should call plannerEventDispatch.emit with the event \'planner.generateConfigured\'', function() {
                globalEventDispatch.on.onCall(0).callsArg(1);

                registerGlobalEvents(globalEventDispatch);

                expect(plannerEventDispatch.emit.args).to.deep.equal([
                    ['planner.generateConfigured'],
                ]);
            });
    });

    it('should call globalEventDispatch.on with the event \'findFiles.search\' ' +
        'and findFiles.search', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[1]).to.deep.equal([
            'findFiles.search',
            findFiles.search,
        ]);
    });

    describe('when the callback is called for globalEventDispatch.on with the event ' +
        'cli.configured', function() {
        describe('if configureInfo.command equals the string \'execute\'', function() {
            it('should call executeEventDispatch.emit once with the event \'executor.scheduled\''+
                'and the passed in configureInfo.testFile', function() {
                let configureInfo = {
                    command: 'execute',
                    testFile: 'myTestFile',
                };
                globalEventDispatch.on.onCall(2).callsArgWith(1, configureInfo);

                registerGlobalEvents(globalEventDispatch);

                expect(executeEventDispatch.emit.args).to.deep.equal([
                    [
                        'executor.scheduled',
                        'myTestFile',
                    ],
                ]);
            });
        });

        describe('if configureInfo.command does not equal the string \'execute\'', function() {
            it('should call runnerEventDispatch.emit once with the event \'runner.scheduled\''+
                ',the passed in configureInfo.testFilePaths, and configureInfo.parallelism', function() {
                let configureInfo = {
                    command: 'notExecute',
                    testFilePaths: ['myTestFile', 'myTestFile2'],
                    parallelism: 5,
                };
                globalEventDispatch.on.onCall(2).callsArgWith(1, configureInfo);

                registerGlobalEvents(globalEventDispatch);

                expect(runnerEventDispatch.emit.args).to.deep.equal([
                    [
                        'runner.scheduled',
                        ['myTestFile', 'myTestFile2'],
                        5,
                    ],
                ]);
            });
        });
    });

    it('should call globalEventDispatch.on with the event \'runner.ended\'', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[3][0]).to.equal('runner.ended');
    });

    describe('when the callback of globalEventDispatch.on with the event ' +
        '\'runner.ended\' is called', function() {
            it('should call cliEventDispatch.emit with the event \'cli.commandFinished\'', function() {
                globalEventDispatch.on.onCall(3).callsArg(1);

                registerGlobalEvents(globalEventDispatch);

                expect(cliEventDispatch.emit.args).to.deep.equal([
                    ['cli.commandFinished'],
                ]);
            });
    });

    it('should call globalEventDispatch.on with the event \componentHandler.configure\' ' +
        'and componentHandler.configure', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[4]).to.deep.equal([
            'componentHandler.configure',
            componentHandler.configure,
        ]);
    });

    it('should call globalEventDispatch.on with the event \componentHandler.getComponentActions\' ' +
        'and componentHandler.getComponentActions', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[5]).to.deep.equal([
            'componentHandler.getComponentActions',
            componentHandler.getComponentActions,
        ]);
    });

    it('should call globalEventDispatch.on with the event \componentHandler.getComponents\' ' +
        'and componentHandler.getComponents', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[6]).to.deep.equal([
            'componentHandler.getComponents',
            componentHandler.getComponents,
        ]);
    });

    it('should call globalEventDispatch.on with the event \componentHandler.getComponent\' ' +
        'and componentHandler.getComponent', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[7]).to.deep.equal([
            'componentHandler.getComponent',
            componentHandler.getComponent,
        ]);
    });

    it('should call globalEventDispatch.on with the event \cpageStateHandler.getPageState\' ' +
        'and pageStateHandler.getPageState', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[8]).to.deep.equal([
            'pageStateHandler.getPageState',
            pageStateHandler.getPageState,
        ]);
    });

    it('should call globalEventDispatch.on with the event \oracle.runDeepEqual\' ' +
        'and oracle.runDeepEqual', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[9]).to.deep.equal([
            'oracle.runDeepEqual',
            oracle.deepEqual,
        ]);
    });

    it('should call globalEventDispatch.on with the event \oracle.runAssertions\' ' +
        'and oracle.runAssertions', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[10]).to.deep.equal([
            'oracle.runAssertions',
            oracle.runAssertions,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateComponents\' ' +
        'and validators.validateComponents', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[11]).to.deep.equal([
            'validators.validateComponents',
            validators.validateComponents,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateTestCases\' ' +
        'and validators.validateTestCases', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[12]).to.deep.equal([
            'validators.validateTestCases',
            validators.validateTestCases,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateElements\' ' +
        'and validators.validateElements', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[13]).to.deep.equal([
            'validators.validateElements',
            validators.validateElements,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateModel\' ' +
        'and validators.validateModel', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[14]).to.deep.equal([
            'validators.validateModel',
            validators.validateModel,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateActions\' ' +
        'and validators.validateActions', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[15]).to.deep.equal([
            'validators.validateActions',
            validators.validateActions,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateEvents\' ' +
        'and validators.validateEvents', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[16]).to.deep.equal([
            'validators.validateEvents',
            validators.validateEvents,
        ]);
    });

    it('should call globalEventDispatch.on with the event \validators.validateChildren\' ' +
        'and validators.validateChildren', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[17]).to.deep.equal([
            'validators.validateChildren',
            validators.validateChildren,
        ]);
    });

    it('should call globalEventDispatch.on with the event \vexpectedState.create\' ' +
        'and expectedState.create', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[18]).to.deep.equal([
            'expectedState.create',
            expectedState.create,
        ]);
    });

    it('should call globalEventDispatch.on with the event \dataStore.create\' ' +
        'and dataStore.create', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[19]).to.deep.equal([
            'dataStore.create',
            dataStore.create,
        ]);
    });


    it('should call globalEventDispatch.on with the event \'configHandler.configCreated\'', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[20][0]).to.equal('configHandler.configCreated');
    });

    describe('when the callback of globalEventDispatch.on with the event ' +
        '\'configHandler.configCreated\' is called', function() {
        it('should call commands with the passed in command', function() {
            globalEventDispatch.on.onCall(20).callsArgWith(1, 'run');

            registerGlobalEvents(globalEventDispatch);

            expect(commands.run.args).to.deep.equal([[]]);
        });
    });

    it('should call globalEventDispatch.on with the event \'configHandler.readyToValidate\''
        + ' and validators.validateConfig', function() {
        registerGlobalEvents(globalEventDispatch);

        expect(globalEventDispatch.on.args[21]).to.deep.equal([
            'configHandler.readyToValidate',
            validators.validateConfig,
        ]);
    });
});
