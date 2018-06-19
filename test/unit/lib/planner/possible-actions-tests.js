'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/possible-actions.js', function() {
    describe('on file require', function() {
        let Emitter;
        let possibleActions;
        let plannerEventDispatch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/possible-actions.js');

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

        it('should Emitter.mixIn once with possibleActions and plannerEventDispatch the parameters', function() {
            possibleActions = require('../../../../lib/planner/possible-actions.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    possibleActions,
                    plannerEventDispatch,
                ],
            ]);
        });
    });

    describe('get', function() {
        let Emitter;
        let next;
        let callback;
        let node;
        let possibleActions;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/possible-actions.js');

            callback = sinon.stub();
            next = sinon.stub();
            node = {
                state: {
                    getComponents: sinon.stub(),
                    getState: sinon.stub(),
                },
                dataStore: {
                    retrieveAll: sinon.stub(),
                },
            };
            Emitter = {
                mixIn: function(myObject) {
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('../util/emitter.js', Emitter);
            mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

            possibleActions = require('../../../../lib/planner/possible-actions.js');            
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call node.state.getComponents once with no arguments', function() {
            node.state.getComponents.returns([]);
            let generator = possibleActions.get(node, callback);

            generator.next();
            generator.next(next);

            expect(node.state.getComponents.args).to.deep.equal([[]]);
        });

        describe('for each component returned from node.state.getComponents', function() {
            describe('for property name of component.actions', function() {
                it('should add each actionIdentifier to the set allActions', function() {
                    let components = [
                        {
                            name: 'firstComponent',
                            actions: {
                                MY_ACTION: {},
                            },
                        },
                        {
                            name: 'secondComponent',
                            actions: {
                                MY_ACTION_2: {},
                                MY_ACTION_3: {},
                            },
                        },
                    ];
                    node.state.getComponents.returns(components);
                    let generator = possibleActions.get(node, callback);

                    generator.next();
                    generator.next(next);

                    expect(callback.args[0][1].allActions).to.deep.equal(
                        new Set([
                            'firstComponent.MY_ACTION',
                            'secondComponent.MY_ACTION_2',
                            'secondComponent.MY_ACTION_3',
                        ])
                    );
                });

                describe('if action.preconditions is undefined', function() {
                    it('should add the actionIdentifier to applicableActions', function() {
                        let components = [
                            {
                                name: 'firstComponent',
                                actions: {
                                    MY_ACTION: {},
                                },
                            },
                            {
                                name: 'secondComponent',
                                actions: {
                                    MY_ACTION_2: {
                                        preconditions: sinon.stub(),
                                    },
                                    MY_ACTION_3: {},
                                },
                            },
                        ];
                        node.state.getComponents.returns(components);
                        let generator = possibleActions.get(node, callback);

                        generator.next();
                        generator.next(next);
                        generator.throw();

                        expect(callback.args[0][1].applicableActions).to.deep.equal(
                            new Set([
                                'firstComponent.MY_ACTION',
                                'secondComponent.MY_ACTION_3',
                            ])
                        );
                    });
                });

                describe('if action.preconditions is defined', function() {
                    describe('if action.parameters is an array', function() {
                        it('should call parameter.generate with node.dataStore as the first parameter', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                            parameters: [
                                                {
                                                    name: 'myParameter',
                                                    generate: sinon.stub(),
                                                },
                                            ],
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.parameters[0].generate.args).to.deep.equal([
                                [
                                    node.dataStore,
                                ],
                            ]);
                        });

                        it('should call parameter.generate with the context of the component', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                            parameters: [
                                                {
                                                    name: 'myParameter',
                                                    generate: sinon.stub(),
                                                },
                                            ],
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.parameters[0].generate.thisValues).to.deep.equal([
                                components[1],
                            ]);
                        });

                        it('should call action.preconditions with the generated parameters ' +
                            'and node.dataStore', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                            parameters: [
                                                {
                                                    name: 'myParameter',
                                                    generate: sinon.stub().returns('generatedParam'),
                                                },
                                                {
                                                    name: 'myParameter2',
                                                    generate: sinon.stub().returns('generatedParam2'),
                                                },
                                            ],
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.preconditions.args).to.deep.equal([
                                [
                                    'generatedParam',
                                    'generatedParam2',
                                    node.dataStore,
                                ],
                            ]);
                        });

                        it('should call action.preconditions with the context of the component', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                            parameters: [
                                                {
                                                    name: 'myParameter',
                                                    generate: sinon.stub(),
                                                },
                                            ],
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.preconditions.thisValues).to.deep.equal([
                                components[1],
                            ]);
                        });
                    });

                    describe('if action.parameters is not an array', function() {
                        it('should call action.preconditions with the parameter as node.dataStore', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.preconditions.args).to.deep.equal([
                                [
                                    node.dataStore,
                                ],
                            ]);
                        });

                        it('should call action.preconditions with the context of the component', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                        },
                                        MY_ACTION_3: {},
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();

                            expect(components[1].actions.MY_ACTION_2.preconditions.thisValues).to.deep.equal([
                                components[1],
                            ]);
                        });

                        describe('if preconditions throws', function() {
                            it('should should throw an error with a helpful message', function() {
                                let components = [
                                    {
                                        name: 'firstComponent',
                                        actions: {
                                            MY_ACTION: {},
                                        },
                                    },
                                    {
                                        name: 'secondComponent',
                                        actions: {
                                            MY_ACTION_2: {
                                                preconditions: sinon.stub().throws(new Error('An error occurred!')),
                                            },
                                            MY_ACTION_3: {},
                                        },
                                    },
                                ];
                                node.state.getComponents.returns(components);
                                let generator = possibleActions.get(node, callback);

                                generator.next();

                                expect(generator.next.bind(generator, next)).to.throw(
                                    `An error with the message 'An error occurred!' was thrown while executing ` +
                                    `preconditions for the action 'secondComponent.MY_ACTION_2'`
                                );
                            });
                        });
                    });

                    it('should call node.state.getState once with no arguments', function() {
                        let components = [
                            {
                                name: 'firstComponent',
                                actions: {
                                    MY_ACTION: {},
                                },
                            },
                            {
                                name: 'secondComponent',
                                actions: {
                                    MY_ACTION_2: {
                                        preconditions: sinon.stub(),
                                    },
                                    MY_ACTION_3: {},
                                },
                            },
                        ];
                        node.state.getComponents.returns(components);
                        let generator = possibleActions.get(node, callback);

                        generator.next();
                        generator.next(next);
                        generator.throw();

                        expect(node.state.getState.args).to.deep.equal([[]]);
                    });

                    it('should call node.dataStore.retrieveAll once with no arguments', function() {
                        let components = [
                            {
                                name: 'firstComponent',
                                actions: {
                                    MY_ACTION: {},
                                },
                            },
                            {
                                name: 'secondComponent',
                                actions: {
                                    MY_ACTION_2: {
                                        preconditions: sinon.stub(),
                                    },
                                    MY_ACTION_3: {},
                                },
                            },
                        ];
                        node.state.getComponents.returns(components);
                        let generator = possibleActions.get(node, callback);

                        generator.next();
                        generator.next(next);
                        generator.throw();

                        expect(node.dataStore.retrieveAll.args).to.deep.equal([[]]);
                    });

                    it('should call possibleActions.emitAsync once with the event \'oracle.runAssertions\', ' +
                        'the state, the dataStore, preconditions, and next', function() {
                        node.state.getState.returns('myState');
                        node.dataStore.retrieveAll.returns('myDataStore');
                        let components = [
                            {
                                name: 'firstComponent',
                                actions: {
                                    MY_ACTION: {},
                                },
                            },
                            {
                                name: 'secondComponent',
                                actions: {
                                    MY_ACTION_2: {
                                        preconditions: sinon.stub().returns('myPreconditions'),
                                    },
                                    MY_ACTION_3: {},
                                },
                            },
                        ];
                        node.state.getComponents.returns(components);
                        let generator = possibleActions.get(node, callback);

                        generator.next();
                        generator.next(next);
                        generator.throw();

                        expect(possibleActions.emitAsync.args).to.deep.equal([
                            [
                                'oracle.runAssertions',
                                'myState',
                                'myDataStore',
                                'myPreconditions',
                                next,
                            ],
                        ]);
                    });

                    describe('if the yield to possibleActions.emit throws', function() {
                        it('should not add the action to applicableActions', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                        },
                                        MY_ACTION_3: {
                                            preconditions: sinon.stub(),
                                        },
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.throw();
                            generator.throw();

                            expect(callback.args[0][1].applicableActions).to.deep.equal(
                                new Set(['firstComponent.MY_ACTION'])
                            );
                        });
                    });

                    describe('if the yield to possibleActions.emit does not throw', function() {
                        it('should add the action to applicableActions', function() {
                            let components = [
                                {
                                    name: 'firstComponent',
                                    actions: {
                                        MY_ACTION: {},
                                    },
                                },
                                {
                                    name: 'secondComponent',
                                    actions: {
                                        MY_ACTION_2: {
                                            preconditions: sinon.stub(),
                                        },
                                        MY_ACTION_3: {
                                            preconditions: sinon.stub(),
                                        },
                                    },
                                },
                            ];
                            node.state.getComponents.returns(components);
                            let generator = possibleActions.get(node, callback);

                            generator.next();
                            generator.next(next);
                            generator.next();
                            generator.next();

                            expect(callback.args[0][1].applicableActions).to.deep.equal(
                                new Set([
                                    'firstComponent.MY_ACTION',
                                    'secondComponent.MY_ACTION_2',
                                    'secondComponent.MY_ACTION_3',
                                ])
                            );
                        });
                    });

                    it('should call the callback once with null and the applicableActions, ' +
                        'and allActions', function() {
                        let components = [
                            {
                                name: 'firstComponent',
                                actions: {
                                    MY_ACTION: {},
                                },
                            },
                            {
                                name: 'secondComponent',
                                actions: {
                                    MY_ACTION_2: {},
                                    MY_ACTION_3: {},
                                },
                            },
                        ];
                        node.state.getComponents.returns(components);
                        let generator = possibleActions.get(node, callback);

                        generator.next();
                        generator.next(next);
                        generator.next();

                        expect(callback.args).to.deep.equal([
                            [
                                null,
                                {
                                    applicableActions: new Set([
                                        'firstComponent.MY_ACTION',
                                        'secondComponent.MY_ACTION_2',
                                        'secondComponent.MY_ACTION_3',
                                    ]),
                                    allActions: new Set([
                                        'firstComponent.MY_ACTION',
                                        'secondComponent.MY_ACTION_2',
                                        'secondComponent.MY_ACTION_3',
                                    ]),
                                },
                            ],
                        ]);
                    });
                });
            });
        });
    });
});
