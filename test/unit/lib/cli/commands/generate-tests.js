'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/generate.js', function() {
    describe('On file being required', function() {
        let generate;
        let EventEmitter;
        let EventEmitterInstance;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', {});
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

        beforeEach(function() {
            mockery.enable({useCleanCache: true});

            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            configHandler = {
                get: sinon.stub().returns('./test/acceptance/components'),
            };

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', configHandler);
            generate = require('../../../../../lib/cli/commands/generate.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call configHandler.get once with \'componentPath\'', function() {
            generate.configure();

            expect(configHandler.get.args).to.deep.equal([['componentPath']]);
        });

        it('should call generate.emit with \'generate.loadComponents\', ' +
            'and the returned configs componentPath', function() {
            generate.configure();

            expect(generate.emit.args[0]).to.deep.equal([
                'generate.loadComponents',
                './test/acceptance/components',
            ]);
        });

        it('should call generate.emit with \'generate.configured\'', function() {
            generate.configure();

            expect(generate.emit.args[1]).to.deep.equal([
                'generate.configured',
            ]);
        });

        it('should call generate.emit twice', function() {
            generate.configure();

            expect(generate.emit.callCount).to.equal(2);
        });
    });
});
