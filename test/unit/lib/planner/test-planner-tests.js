'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/test-planner.js', function() {
    describe('on file require', function() {
        let Emitter;
        let testPlanner;
        let plannerEventDispatch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/test-planner.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            plannerEventDispatch = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);
            mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
            mockery.registerMock('../util/config-handler.js', {});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should Emitter.mixIn once with testPlanner and plannerEventDispatch as parameters', function() {
            testPlanner = require('../../../../lib/planner/test-planner.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    testPlanner,
                    plannerEventDispatch,
                ],
            ]);
        });
    });

    describe('generateTests', function() {
        let Emitter;
        let testPlanner;
        let plannerEventDispatch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/planner/test-planner.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            plannerEventDispatch = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);
            mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
            mockery.registerMock('../util/config-handler.js', {});

            testPlanner = require('../../../../lib/planner/test-planner.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call testPlanner.emit with the event \'testPlanner.createPlans\'', function() {
            testPlanner.generateTests();

            expect(testPlanner.emit.args[0][0]).to.deep.equal('testPlanner.createPlans');
        });

        describe('when the callback for testPlanner.emit with the event ' +
            '\'testPlanner.createPlans\' is called', function() {
            
        });
    });
});