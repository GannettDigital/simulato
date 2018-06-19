'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/generate.js', function() {
    describe('on file being required', function() {
        let Emitter;
        let cliEventDispatch;
        let generate;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            cliEventDispatch = sinon.stub();

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', {});
            mockery.registerMock('../cli-event-dispatch/cli-event-dispatch.js', cliEventDispatch);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call Emitter.mixIn once with generate and the cliEventDispatch', function() {
            generate = require('../../../../../lib/cli/commands/generate.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    generate,
                    cliEventDispatch,
                ],
            ]);
        });
    });

    describe('configure', function() {
        let generate;
        let Emitter;
        let configHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});

            mockery.registerAllowable('../../../../../lib/cli/commands/generate.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            configHandler = {
                get: sinon.stub().returns('./test/acceptance/components'),
            };

            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../../util/config-handler.js', configHandler);
            mockery.registerMock('../cli-event-dispatch/cli-event-dispatch.js', {});

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

        it('should call generate.emit with \'componentHandler.configure\', ' +
            'and the returned configs componentPath', function() {
            generate.configure();

            expect(generate.emit.args[0]).to.deep.equal([
                'componentHandler.configure',
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
