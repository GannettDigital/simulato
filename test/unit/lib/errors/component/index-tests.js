'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/index.js', function() {
  let NO_ENTRY_POINT;
  let NON_UNIQUE_COMPONENT;
  let FILE_TYPE_ERROR;
  let COMPONENT_TYPE_ERROR;
  let NO_COMPONENTS_FOUND;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/index.js');

    NO_ENTRY_POINT = sinon.stub();
    NON_UNIQUE_COMPONENT = sinon.stub();
    FILE_TYPE_ERROR = sinon.stub();
    COMPONENT_TYPE_ERROR = sinon.stub();
    NO_COMPONENTS_FOUND = sinon.stub();

    mockery.registerMock('./no-entry-point.js', NO_ENTRY_POINT);
    mockery.registerMock('./non-unique-component.js', NON_UNIQUE_COMPONENT);
    mockery.registerMock('./file-type-error.js', FILE_TYPE_ERROR);
    mockery.registerMock('./component-type-error.js', COMPONENT_TYPE_ERROR);
    mockery.registerMock('./no-components-found.js', NO_COMPONENTS_FOUND);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 5 items on an object', function() {
    let result = require('../../../../../lib/errors/component');

    expect(Object.getOwnPropertyNames(result).length).to.equal(5);
  });

  it('should have the property \'NO_ENTRY_POINT\' with the value from requiring'
    + ' \'./model-not-object.js\'', function() {
    let result = require('../../../../../lib/errors/component/index.js');

    expect(result.NO_ENTRY_POINT).to.deep.equal(NO_ENTRY_POINT);
  });

  it('should have the property \'NON_UNIQUE_COMPONENT\' with the value from requiring'
    + ' \'./non-unique-component.js\'', function() {
    let result = require('../../../../../lib/errors/component/index.js');

    expect(result.NON_UNIQUE_COMPONENT).to.deep.equal(NON_UNIQUE_COMPONENT);
  });

  it('should have the property \'FILE_TYPE_ERROR\' with the value from requiring'
    + ' \'./file-type-error.js\'', function() {
    let result = require('../../../../../lib/errors/component/index.js');

    expect(result.FILE_TYPE_ERROR).to.deep.equal(FILE_TYPE_ERROR);
  });

  it('should have the property \'COMPONENT_TYPE_ERROR\' with the value from requiring'
    + ' \'./component-type-error.js\'', function() {
    let result = require('../../../../../lib/errors/component/index.js');

    expect(result.COMPONENT_TYPE_ERROR).to.deep.equal(COMPONENT_TYPE_ERROR);
  });

  it('should have the property \'NO_COMPONENTS_FOUND\' with the value from requiring'
    + ' \'./no-components-found.js\'', function() {
    let result = require('../../../../../lib/errors/component/index.js');

    expect(result.NO_COMPONENTS_FOUND).to.deep.equal(NO_COMPONENTS_FOUND);
  });
});
