'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/start-nodes.js', function() {
    describe('on file require', function() {
        let Emitter;
        let startNodes;
        let plannerEventDispatch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/start-nodes.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emitAsync = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            plannerEventDispatch = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);
            mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should Emitter.mixIn once with startNodes and plannerEventDispatch as parameters', function() {
            startNodes = require('../../../../lib/planner/start-nodes.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    startNodes,
                    plannerEventDispatch,
                ],
            ]);
        });
    });

    describe('get', function() {
        let Emitter;
        let startNodes;
        let next;
        let callback;
        let node;
        let nodeTwo;
        let components;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/start-nodes.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emitAsync = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            next = sinon.stub();
            callback = sinon.stub();
            global.SimulatoError = {
                COMPONENT: {
                    NO_ENTRY_POINT: sinon.stub(),
                },
            };
            components = {
                componentOne: {
                    entryComponent: {
                        name: 'myName',
                        state: {
                            property: 'value',
                        },
                        options: {
                            myOption: 'option',
                        },
                    },
                },
                componentTwo: {
                    entryComponent: {
                        name: 'myName',
                        state: {
                            property: 'value',
                        },
                        options: {
                            myOption: 'option',
                        },
                    },
                },
            };
            node = {
                state: {
                    createAndAddComponent: sinon.stub(),
                },
                testCase: {
                    push: sinon.stub(),
                },
            };
            nodeTwo = {
                state: {
                    createAndAddComponent: sinon.stub(),
                },
                testCase: {
                    push: sinon.stub(),
                },
            };

            mockery.registerMock('../util/emitter.js', Emitter);
            mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

            startNodes = require('../../../../lib/planner/start-nodes.js');
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call startNodes.emitAsync with the event \'componentHandler.getComponents\' and next', function() {
            let generator = startNodes.get(callback);

            generator.next();
            generator.next(next);

            expect(startNodes.emitAsync.args[0]).to.deep.equal([
                'componentHandler.getComponents',
                next,
            ]);
        });

        describe('if there are no components marked as entryComponent', function() {
            it('should throw an error', function() {
                let generator = startNodes.get(callback);
                let components = {
                    'componentOne': {},
                    'componentTwo': {},
                };

                generator.next();
                generator.next(next);

                expect(generator.next.bind(generator, components)).to.throw();
            });

            it('should call SimulatoError.COMPONENT.NO_ENTRY_COMPONENT with an error message', function() {
                let generator = startNodes.get(callback);
                components = {
                    'componentOne': {},
                    'componentTwo': {},
                };

                generator.next();
                generator.next(next);
                try {
                    generator.next(components);
                } catch (err) {

                }

                expect(SimulatoError.COMPONENT.NO_ENTRY_POINT.args).to.deep.equal([
                    [
                        'Planning failed, no entry component found',
                    ],
                ]);
            });
        });

        describe('for each entry component', function() {
            it('should call startNodes.emitAsync with the event \'startNodes.createSearchNode\', and empty set, ' +
                ' and next', function() {
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);

                expect(startNodes.emitAsync.args[1]).to.deep.equal([
                    'startNodes.createSearchNode',
                    new Set(),
                    next,
                ]);
            });

            it('should call node.state.createAndAddComponent with the type, name, state, and options in an ' +
                'object', function() {
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);

                expect(node.state.createAndAddComponent.args).to.deep.equal([
                    [
                        {
                            type: 'componentOne',
                            name: 'myName',
                            state: {
                                property: 'value',
                            },
                            options: {
                                myOption: 'option',
                            },
                        },
                    ],
                ]);
            });

            it('should call node.testCase.push with the type, name, state, and options in an object', function() {
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);

                expect(node.testCase.push.args).to.deep.equal([
                    [
                        {
                            type: 'componentOne',
                            name: 'myName',
                            state: {
                                property: 'value',
                            },
                            options: {
                                myOption: 'option',
                            },
                        },
                    ],
                ]);
            });

            it('should calll startNodes.emitAsync with the event \'possibleActions.get\', ' +
                ' node, and next', function() {
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);

                expect(startNodes.emitAsync.args[2]).to.deep.equal([
                    'possibleActions.get',
                    node,
                    next,
                ]);
            });

            it('should set node.actions to the returned applicableActions from yielding to startNodes.emitAsync ' +
                'with the event \'possibleActions.get\'', function() {
                let generator = startNodes.get(callback);
                let applicableActions = new Set(['ACTION_1', 'ACTION_2']);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);
                generator.next({applicableActions});

                expect(node.actions).to.deep.equal(new Set(['ACTION_1', 'ACTION_2']));
            });

            it('should set node.allActions to the returned allActions from yielding to startNodes.emitAsync with the ' +
                'event \'possibleActions.get\'', function() {
                let generator = startNodes.get(callback);
                let allActions = new Set(['ACTION_1', 'ACTION_2', 'ACTION_3']);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);
                generator.next({allActions});

                expect(node.allActions).to.deep.equal(new Set(['ACTION_1', 'ACTION_2', 'ACTION_3']));
            });
        });

        describe('if there are two entryComponents', function() {
            it('should call startNodes.emitAsync 5 times', function() {
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);
                generator.next({});
                generator.next(nodeTwo);
                generator.next({});

                expect(startNodes.emitAsync.callCount).to.equal(5);
            });
        });

        describe('if there is one entryComponent', function() {
            it('should call startNodes.emitAsync 3 times', function() {
                delete components.componentTwo;
                let generator = startNodes.get(callback);

                generator.next();
                generator.next(next);
                generator.next(components);
                generator.next(node);
                generator.next({});

                expect(startNodes.emitAsync.callCount).to.equal(3);
            });
        });

        it('should call the passed in callback once with null, and the nodes', function() {
            let generator = startNodes.get(callback);

            generator.next();
            generator.next(next);
            generator.next(components);
            generator.next(node);
            generator.next({});
            generator.next(nodeTwo);
            generator.next({});

            expect(callback.args).to.deep.equal([
                [
                    null,
                    [node, nodeTwo],
                ],
            ]);
        });
    });
});
