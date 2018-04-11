'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-events.js', function() {
    let validateEvents;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/util/validators/validate-events.js');

        global.SimulatoError = {
            EVENT: {
                EVENTS_NOT_ARRAY: sinon.stub(),
                EVENT_NOT_OBJECT: sinon.stub(),
                EVENT_OBJECT_PROPERTY_TYPE: sinon.stub(),
            },
        };

        validateEvents = require('../../../../../lib/util/validators/validate-events.js');
    });

    afterEach(function() {
        delete global.SimulatoError;
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('if the passed in events is valid', function() {
        it('should should not throw', function() {
            let events = [
                {
                    name: 'aName',
                    listener: sinon.stub(),
                },
                {
                    name: ['name1', 'name2'],
                    listener: sinon.stub(),
                },
            ];

            expect(validateEvents.bind(null, events, '', '')).to.not.throw();
        });
    });

    describe('if the passed in events is not an array', function() {
        it('should throw an error', function() {
            let error = new Error('An error occurred!');
            SimulatoError.EVENT.EVENTS_NOT_ARRAY.throws(error);

            expect(validateEvents.bind(null, '', '', '')).to.throw('An error occurred!');
        });

        it('should call SimulatoError.EVENT.EVENTS_NOT_ARRAY once with an error message', function() {
            try {
                validateEvents('', 'myInstance', 'myComponent');
            } catch (error) {}

            expect(SimulatoError.EVENT.EVENTS_NOT_ARRAY.args).to.deep.equal([
                [`Events for 'myInstance' were not returned as an Array by parent component 'myComponent'`],
            ]);
        });
    });

    describe('if the passed in events has an entry that is not an object', function() {
        it('should throw an error', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                'Not an object',
            ];
            let error = new Error('An error occurred!');
            SimulatoError.EVENT.EVENT_NOT_OBJECT.throws(error);

            expect(validateEvents.bind(null, events, '', '')).to.throw('An error occurred!');
        });

        it('should call SimulatoError.EVENT.EVENT_NOT_OBJECT once with an error message', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                'Not an object',
            ];

            try {
                validateEvents(events, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(SimulatoError.EVENT.EVENT_NOT_OBJECT.args).to.deep.equal([
                [`Event of events array at index '1' for component 'myComponent' must be an object`],
            ]);
        });
    });

    describe('if an event \'name\' property is not a string or an array', function() {
        it('should throw an error', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                {
                    listener: sinon.stub(),
                },
            ];
            let error = new Error('An error occurred!');
            SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateEvents.bind(null, events, '', '')).to.throw('An error occurred!');
        });

        it('should call SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                {
                    listener: sinon.stub(),
                },
            ];

            try {
                validateEvents(events, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'name' property of event at index '1' for component 'myComponent' ` +
                    `must be a string or an array. Found 'undefined'`,
                ],
            ]);
        });
    });

    describe('if the event \'name\' property is an Array', function() {
        describe('for each name in the array', function() {
            it('should throw an error if the name is not a string', function() {
                let events = [
                    {
                        name: 'hey',
                        listener: sinon.stub(),
                    },
                    {
                        name: [1, 'someName'],
                        listener: sinon.stub(),
                    },
                ];
                let error = new Error('An error occurred!');
                SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE.throws(error);

                expect(validateEvents.bind(null, events, '', '')).to.throw('An error occurred!');
            });
        });
    });

    describe('if an event \'listener\' property is not a function', function() {
        it('should throw an error', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                {
                    name: ['hey2', 'hey3'],
                },
            ];
            let error = new Error('An error occurred!');
            SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateEvents.bind(null, events, '', '')).to.throw('An error occurred!');
        });

        it('should call SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let events = [
                {
                    name: 'hey',
                    listener: sinon.stub(),
                },
                {
                    name: ['hey2', 'hey3'],
                },
            ];

            try {
                validateEvents(events, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(SimulatoError.EVENT.EVENT_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'listener' property of event at index '1' for component 'myComponent' ` +
                    `must be a function. Found 'undefined'`,
                ],
            ]);
        });
    });
});
