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

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../lib/global-event-dispatch/register-global-events.js');

        runnerEventDispatch = {
            emit: sinon.stub(),
            on: sinon.stub(),
        };
        plannerEventDispatch = {
            emit: sinon.stub(),
            on: sinon.stub(),
        };
        executeEventDispatch = {
            emit: sinon.stub(),
            on: sinon.stub(),
        };
        cliEventDispatch = {
            emit: sinon.stub(),
            on: sinon.stub(),
        };
        componentHandler = {
            on: sinon.stub(),
            configure: sinon.stub(),
            getComponent: sinon.stub(),
            getComponents: sinon.stub(),
            getComponentActions: sinon.stub(),
        };
        pageStateHandler = {
            on: sinon.stub(),
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
        };
        dataStore = {
            create: sinon.stub(),
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

        registerGlobalEvents = require('../../../../lib/global-event-dispatch/register-global-events.js');
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should call cliEventDispatch.on 5 times', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.callCount).to.equal(5);
    });

    it('should call cliEventDispatch.on with the event \'cli.loadComponents\'' +
        'and componentHandler.configure', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.args[0]).to.deep.equal([
            'cli.loadComponents',
            componentHandler.configure,
        ]);
    });

    it('should call cliEventDispatch.on with the event \'cli.generateConfigured\'', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.args[1][0]).to.equal('cli.generateConfigured');
    });

    describe('when the callback is called for cliEventDispatch.on with the event ' +
        'cliEventDispatch.loadComponents', function() {
        it('should call plannerEventDispatch.emit once with the event \'planner.generateConfigured\''+
            'and the passed in configureInfo', function() {
            cliEventDispatch.on.onCall(1).callsArgWith(1, 'myConfigureInfo');

            registerGlobalEvents();

            expect(plannerEventDispatch.emit.args).to.deep.equal([
                [
                    'planner.generateConfigured',
                    'myConfigureInfo',
                ],
            ]);
        });
    });

    it('should call cliEventDispatch.on with the event \'cli.findFiles\'', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.args[2][0]).to.equal('cli.findFiles');
    });

    it('should call cliEventDispatch.on with the event \'cli.testCasesReadyToValidate\'', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.args[3][0]).to.equal('cli.testCasesReadyToValidate');
    });

    it('should call cliEventDispatch.on with the event \'cli.configured\'', function() {
        registerGlobalEvents();

        expect(cliEventDispatch.on.args[4][0]).to.equal('cli.configured');
    });

    describe('when the callback is called for cliEventDispatch.on with the event ' +
        'cliEventDispatch.configured', function() {
        describe('if configureInfo.command equals the string \'execute\'', function() {
            it('should call executeEventDispatch.emit once with the event \'executor.scheduled\''+
                'and the passed in configureInfo.testFile', function() {
                let configureInfo = {
                    command: 'execute',
                    testFile: 'myTestFile',
                };
                cliEventDispatch.on.onCall(4).callsArgWith(1, configureInfo);

                registerGlobalEvents();

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
                cliEventDispatch.on.onCall(4).callsArgWith(1, configureInfo);

                registerGlobalEvents();

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

    it('should call runnerEventDispatch.on once', function() {
        registerGlobalEvents();

        expect(runnerEventDispatch.on.callCount).to.equal(1);
    });

    it('should call runnerEventDispatch.on with the event \'runner.ended\'', function() {
        registerGlobalEvents();

        expect(runnerEventDispatch.on.args[0][0]).to.equal('runner.ended');
    });

    describe('when the callback is called for runnerEventDispatch.on with the event ' +
        'runner.ended', function() {
        it('should call cliEventDispatch.emit once with the event \'cli.commandFinished\'', function() {
            runnerEventDispatch.on.onCall(0).callsArg(1);

            registerGlobalEvents();

            expect(cliEventDispatch.emit.args).to.deep.equal([
                [
                    'cli.commandFinished',
                ],
            ]);
        });
    });

    it('should call executeEventDispatch.on 8 times', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.callCount).to.equal(8);
    });

    it('should call executeEventDispatch.on with the event \'executor.loadComponents\'' +
        'and componentHandler.configure', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[0]).to.deep.equal([
            'executor.loadComponents',
            componentHandler.configure,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.getComponents\'' +
        'and componentHandler.getComponents', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[1]).to.deep.equal([
            'executor.getComponents',
            componentHandler.getComponents,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.createExpectedState\'' +
        'and expectedState.create', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[2]).to.deep.equal([
            'executor.createExpectedState',
            expectedState.create,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.createDataStore\'' +
        'and dataStore.create', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[3]).to.deep.equal([
            'executor.createDataStore',
            dataStore.create,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.getPageState\'' +
        'and pageStateHandler.getPageState', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[4]).to.deep.equal([
            'executor.getPageState',
            pageStateHandler.getPageState,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.runAssertions\'' +
        'and oracle.runAssertions', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[5]).to.deep.equal([
            'executor.runAssertions',
            oracle.runAssertions,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.runDeepEqual\'' +
        'and oracle.deepEqual', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[6]).to.deep.equal([
            'executor.runDeepEqual',
            oracle.deepEqual,
        ]);
    });

    it('should call executeEventDispatch.on with the event \'executor.ended\'', function() {
        registerGlobalEvents();

        expect(executeEventDispatch.on.args[7][0]).to.equal('executor.ended');
    });

    describe('when the callback is called for executeEventDispatch.on with the event ' +
        'executor.ended', function() {
        it('should call cliEventDispatch.emit once with the event \'cli.commandFinished\'', function() {
            executeEventDispatch.on.onCall(7).callsArg(1);

            registerGlobalEvents();

            expect(cliEventDispatch.emit.args).to.deep.equal([
                [
                    'cli.commandFinished',
                ],
            ]);
        });
    });

    it('should call componentHandler.on 2 times', function() {
        registerGlobalEvents();

        expect(componentHandler.on.callCount).to.equal(2);
    });

    it('should call componentHandler.on with the event \'componentHandler.findFiles\'' +
        'and findFiles', function() {
        registerGlobalEvents();

        expect(componentHandler.on.args[0]).to.deep.equal([
            'componentHandler.findFiles',
            findFiles.search,
        ]);
    });

    it('should call componentHandler.on with the event \'componentHandler.filesReadyToValidate\'' +
        'and validators.validateComponents', function() {
        registerGlobalEvents();

        expect(componentHandler.on.args[1]).to.deep.equal([
            'componentHandler.filesReadyToValidate',
            validators.validateComponents,
        ]);
    });

    it('should call pageStateHandler.on 1 times', function() {
        registerGlobalEvents();

        expect(pageStateHandler.on.callCount).to.equal(1);
    });

    it('should call pageStateHandler.on with the event \'pageStateHandler.getComponents\'' +
        'and componentHandler.getComponents', function() {
        registerGlobalEvents();

        expect(pageStateHandler.on.args[0]).to.deep.equal([
            'pageStateHandler.getComponents',
            componentHandler.getComponents,
        ]);
    });

    it('should call expectedState.on 6 times', function() {
        registerGlobalEvents();

        expect(expectedState.on.callCount).to.equal(6);
    });

    it('should call expectedState.on with the event \'expectedState.getComponent\'' +
        'and componentHandler.getComponent', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[0]).to.deep.equal([
            'expectedState.getComponent',
            componentHandler.getComponent,
        ]);
    });

    it('should call expectedState.on with the event \'expectedState.elementReceived\'' +
        'and validators.validateElements', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[1]).to.deep.equal([
            'expectedState.elementsReceived',
            validators.validateElements,
        ]);
    });

    it('should call expectedState.on with the event \'expectedState.modelReceived\'' +
        'and validators.validateModel', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[2]).to.deep.equal([
            'expectedState.modelReceived',
            validators.validateModel,
        ]);
    });

    it('should call expectedState.on with the event \'expectedState.eventsReceived\'' +
        'and validators.validateEvents', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[3]).to.deep.equal([
            'expectedState.eventsReceived',
            validators.validateEvents,
        ]);
    });

    it('should call expectedState.on with the event \'expectedState.childrenReceived\'' +
        'and validators.validateChildren', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[4]).to.deep.equal([
            'expectedState.childrenReceived',
            validators.validateChildren,
        ]);
    });

    it('should call expectedState.on with the event \'expectedState.actionsReceived\'' +
        'and validators.validateActions', function() {
        registerGlobalEvents();

        expect(expectedState.on.args[5]).to.deep.equal([
            'expectedState.actionsReceived',
            validators.validateActions,
        ]);
    });

    it('should call plannerEventDispatch.on 5 times', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.callCount).to.equal(5);
    });

    it('should call plannerEventDispatch.on with the event \'plannerEventDispatch.getComponentActions\'' +
        'and componentHandler.getComponentActions', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.args[0]).to.deep.equal([
            'planner.getComponentActions',
            componentHandler.getComponentActions,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'plannerEventDispatch.getComponents\'' +
        'and componentHandler.getComponents', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.args[1]).to.deep.equal([
            'planner.getComponents',
            componentHandler.getComponents,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'plannerEventDispatch.createExpectedState\'' +
        'and expectedState.create', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.args[2]).to.deep.equal([
            'planner.createExpectedState',
            expectedState.create,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'plannerEventDispatch.runAssertions\'' +
        'and oracle.runAssertions', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.args[3]).to.deep.equal([
            'planner.runAssertions',
            oracle.runAssertions,
        ]);
    });

    it('should call plannerEventDispatch.on with the event \'plannerEventDispatch.createDataStore\'' +
        'and dataStore.create', function() {
        registerGlobalEvents();

        expect(plannerEventDispatch.on.args[4]).to.deep.equal([
            'planner.createDataStore',
            dataStore.create,
        ]);
    });
});
