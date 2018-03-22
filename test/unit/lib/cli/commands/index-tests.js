'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/index.js', function() {
    let run;
    let generate;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/cli/commands');

        run = sinon.stub();
        run.configure = true;
        generate = sinon.stub();
        generate.configure = true;

        mockery.registerMock('./run.js', run);
        mockery.registerMock('./generate.js', generate);
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });
    it('should have the property \'run\' with the value from requiring'
    + ' \'./run.js\'.configure', function() {
      let result = require('../../../../../lib/cli/commands');

      expect(result.run).to.deep.equal(true);
    });
    it('should have the property \'generate\' with the value from requiring'
    + ' \'./generate.js\'.configure', function() {
      let result = require('../../../../../lib/cli/commands');

      expect(result.generate).to.deep.equal(true);
    });
});
