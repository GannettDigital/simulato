'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/test-generation-techniques/action-focused-technique.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let actionFocusedTechnique;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('../set-operations.js', {});
            mockery.registerMock('events', {EventEmitter});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of executionEngine to a new EventEmitter', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(Object.getPrototypeOf(actionFocusedTechnique)).to.deep.equal(EventEmitterInstance);
        });

        it('should call actionFocusedTechnique.on twice', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(actionFocusedTechnique.on.callCount).to.equal(2);
        });

        it('should call actionFocusedTechnique.on with the event \'actionFocusedTechnique.actionsDetermined\' ' +
            'and the function actionFocusedTechnique._createPlans', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(actionFocusedTechnique.on.args[0]).to.deep.equal([
                'actionFocusedTechnique.actionsDetermined',
                actionFocusedTechnique._createPlans,
            ]);
        });

        it('should call actionFocusedTechnique.on with the event \'actionFocusedTechnique.plansCreated\' ' +
            'and the function actionFocusedTechnique._reduceToMinimumSetOfPlans', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(actionFocusedTechnique.on.args[1]).to.deep.equal([
                'actionFocusedTechnique.plansCreated',
                actionFocusedTechnique._reduceToMinimumSetOfPlans,
            ]);
        });
    });

    describe('determineActions', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let actionFocusedTechnique;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            global.MbttError = {
                COMPONENT: {
                    NO_ENTRY_POINT: sinon.stub(),
                },
            };

            mockery.registerMock('../set-operations.js', {});
            mockery.registerMock('events', {EventEmitter});

            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );
        });

        afterEach(function() {
            delete global.MbttError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call actionFocusedTechnique.emit', function() {
            actionFocusedTechnique.determineActions();

            expect(actionFocusedTechnique.emit.callCount).to.equal(1);
        });

        it('should call actionFocusedTechnique.emit with the event' +
            '\'actionFocusedTechnique.getComponents\'', function() {
            actionFocusedTechnique.determineActions();

            expect(actionFocusedTechnique.emit.args[0][0]).to.deep.equal('actionFocusedTechnique.getComponents');
        });

        describe('when the actionFocusedTechnique.emit callback is called with the event' +
            '\'actionFocusedTechnique.getComponents\'', function() {
            describe('for each component', function() {
                it('should add a component to entryComponents if the component\'s \'entryComponent\'' +
                    'property is true', function() {
                    let components = {
                        myComponent: {
                            entryComponent: true,
                        },
                        myComponent2: {
                            entryComponent: true,
                        },
                        myComponent3: {
                            entryComponent: false,
                        },
                    };
                    actionFocusedTechnique.emit.onCall(0).callsArgWith(1, null, components);

                    actionFocusedTechnique.determineActions();

                    expect(actionFocusedTechnique.emit.args[1][1]).to.deep.equal([
                        'myComponent', 'myComponent2',
                    ]);
                });
            });

            describe('if entryComponents has a length of 0', function() {
                it('should throw a error', function() {
                    let components = {
                        myComponent3: {
                            entryComponent: false,
                        },
                    };
                    actionFocusedTechnique.emit.onCall(0).callsArgWith(1, null, components);
                    MbttError.COMPONENT.NO_ENTRY_POINT.returns({message: 'My Error'});

                    expect(actionFocusedTechnique.determineActions).to.throw('My Error');
                });

                it('shoul call MbttError.COMPONENT.NO_ENTRY_POINT once with a planning failed message', function() {
                    let components = {
                        myComponent3: {
                            entryComponent: false,
                        },
                    };
                    actionFocusedTechnique.emit.onCall(0).callsArgWith(1, null, components);
                    MbttError.COMPONENT.NO_ENTRY_POINT.returns({message: 'My Error'});

                    try {
                        actionFocusedTechnique.determineActions();
                    } catch (error) {

                    }

                    expect(MbttError.COMPONENT.NO_ENTRY_POINT.args).to.deep.equal([
                        ['Planning failed, no entry component found'],
                    ]);
                });
            });

            describe('if entryComponents does not have a length of 0', function() {
                it('should call actionFocusedTechnique.emit twice', function() {
                    let components = {
                        myComponent: {
                            entryComponent: true,
                        },
                        myComponent2: {
                            entryComponent: true,
                        },
                    };
                    actionFocusedTechnique.emit.onCall(0).callsArgWith(1, null, components);

                    actionFocusedTechnique.determineActions();

                    expect(actionFocusedTechnique.emit.callCount).to.equal(2);
                });

                it('should call actionFocusedTechnique.emit with the event \'actionFocusedTechnique.' +
                    'actionsDetermined\', entryComponents, and the passed in predeterminedGoalAction', function() {
                        let components = {
                            myComponent: {
                                entryComponent: true,
                            },
                            myComponent2: {
                                entryComponent: true,
                            },
                        };
                        actionFocusedTechnique.emit.onCall(0).callsArgWith(1, null, components);

                        actionFocusedTechnique.determineActions('predeterminedAction');

                        expect(actionFocusedTechnique.emit.args[1]).to.deep.equal([
                            'actionFocusedTechnique.actionsDetermined',
                            ['myComponent', 'myComponent2'],
                            'predeterminedAction',
                        ]);
                });
            });
        });
    });
});
