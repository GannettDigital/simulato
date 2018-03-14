'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-components.js', function() {
  describe('on file being required', function() {
    beforeEach(function() {
      mockery.enable({useCleanCache: true});

      mockery.registerMock('path', {});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-components.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should export a function', function() {
        let result = require('../../../../../lib/util/validators/validate-components.js');

        expect(result).to.be.a('function');
    });
  });

  describe('on exported function being executed', function() {
    let validateComponents;
    let MbttError;
    let path;
    let files;
    let callback;
    let component1;
    let component3;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-components.js');

      path = {
        extname: sinon.stub(),
      };

      callback = sinon.stub();

      files = [
        'path/to/file1.js',
        'path/to/file2',
        'path/to/file3.js',
      ];

      component1 = {
        name: 'component1',
        elements: sinon.stub(),
        model: sinon.stub(),
        actions: sinon.stub(),
      };

      component3 = {
        name: 'component3',
        elements: sinon.stub(),
        model: sinon.stub(),
        actions: sinon.stub(),
      };

      path.extname.onCall(0).returns('.js');
      path.extname.onCall(1).returns('');
      path.extname.onCall(2).returns('.js');

      sinon.spy(files, 'filter');

      MbttError = {
        COMPONENT: {
          FILE_TYPE_ERROR: sinon.stub(),
          COMPONENT_TYPE_ERROR: sinon.stub(),
        },
      };
      global.MbttError = MbttError;

      mockery.registerMock('path', path);
      mockery.registerMock('path/to/file1.js', component1);
    });

    afterEach(function() {
      delete global.MbttError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });
    it('should call filter on the passed in files', function() {
      mockery.registerMock('path/to/file3.js', component3);
      validateComponents = require('../../../../../lib/util/validators/validate-components.js');

      validateComponents(files, callback);

      expect(files.filter.callCount).to.equal(1);
    });

    describe('when the callback on the files filter function is called', function() {
      it('should call path.extname with file passed in for each file in files', function() {
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');

        validateComponents(files, callback);

        expect(path.extname.args).to.deep.equal([
          ['path/to/file1.js'],
          ['path/to/file2'],
          ['path/to/file3.js'],
        ]);
      });

      describe('when callback is called', function() {
        it('should filter out every file that doesnt end in .js and set files to updated array', function() {
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');

          validateComponents(files, callback);

          expect(callback.args).to.deep.equal([
            [
              ['path/to/file1.js', 'path/to/file3.js'],
            ],
          ]);
        });
      });
    });

    describe('for each file of the passed in files', function() {
      it('should throw an error if the file cannot be required', function() {
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        files.push('path/to/file4.js');
        path.extname.onCall(3).returns('.js');
        mockery.registerAllowable('path/to/file4.js');

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The file at path 'path/to/file4.js' was unable to be `+
          `loaded for reason 'Cannot find module 'path/to/file4.js''`
        );
      });

      it('should throw an error if the component is not an object', function() {
        component3 = ['array', 'of', 'stuff'];
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The component at file path ${files[2]} must be an object`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The component at file path path/to/file3.js must be an object`
        );
      });

      it('should throw an error if the component.name is not a string', function() {
        delete component3.name;
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The component at file path ${files[2]} must have a string for name property`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The component at file path path/to/file3.js must have a string for name property`
        );
      });

      describe('if the component has entryComponent property', function() {
        it('should throw an error if the entryComponent property is not an object', function() {
          component3.entryComponent = ['entry', 'options'];
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');
          MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
            {message: `The entryComponent property must be an object for component ${component3.name}`}
          );

          expect(validateComponents.bind(null, files, callback)).to.throw(
            `The entryComponent property must be an object for component component3`
          );
        });

        it('should throw an error if the entryComponent.name is not a string', function() {
          component3.entryComponent = {name: {key: 'im an object'}};
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');
          MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
            {
              message:
                `The entryComponent.name property is required and must be a string for component ${component3.name}`,
            }
          );

          expect(validateComponents.bind(null, files, callback)).to.throw(
            `The entryComponent.name property is required and must be a string for component component3`
          );
        });

        it('should throw an error if the entryComponent.state is not an object', function() {
          component3.entryComponent = {
            name: 'entryComponent',
            state: [],
          };
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');
          MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
            {
              message:
              `The entryComponent.state property is required and must be an object for component ${component3.name}`,
            }
          );

          expect(validateComponents.bind(null, files, callback)).to.throw(
            `The entryComponent.state property is required and must be an object for component component3`
          );
        });

        it('should not throw an error if the entryComponent.state is an object', function() {
          component3.entryComponent = {
            name: 'entryComponent',
            state: {},
          };
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');
          MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
            {
              message:
              `The entryComponent.state property is required and must be an object for component ${component3.name}`,
            }
          );

          expect(validateComponents.bind(null, files, callback)).to.not.throw();
        });
      });

      it('should throw an error if the component.elements is not a function', function() {
        component3.elements = {};
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The elements property must be a function for component ${component3.name}`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The elements property must be a function for component component3`
        );
      });

      it('should throw an error if the component.model is not a function', function() {
        component3.model = 'im a string';
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The model property must be a function for component ${component3.name}`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The model property must be a function for component component3`
        );
      });

      describe('if the component has options property', function() {
        it('should throw an error if the options property is not an object', function() {
          component3.options = ['entry', 'options'];
          mockery.registerMock('path/to/file3.js', component3);
          validateComponents = require('../../../../../lib/util/validators/validate-components.js');
          MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
            {message: `The options property must be an object for component '${component3.name}'`}
          );

          expect(validateComponents.bind(null, files, callback)).to.throw(
            `The options property must be an object for component 'component3'`
          );
        });

        describe('if the options property contains the property \'dynamicArea\'', function() {
          it('should throw an error if the dynamicArea value is not a string', function() {
            component3.options = {dynamicArea: 1};
            mockery.registerMock('path/to/file3.js', component3);
            validateComponents = require('../../../../../lib/util/validators/validate-components.js');
            MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
              {
                message:
                `The component.options.dynamicArea property must be an string for component '${component3.name}'`,
              }
            );

            expect(validateComponents.bind(null, files, callback)).to.throw(
              `The component.options.dynamicArea property must be an string for component 'component3'`
            );
          });
          it('should throw no error if the dynamicArea value is a string', function() {
            component3.options = {dynamicArea: 'dynamicArea1'};
            mockery.registerMock('path/to/file3.js', component3);
            validateComponents = require('../../../../../lib/util/validators/validate-components.js');
            MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
              {
                message:
                `The component.options.dynamicArea property must be an string for component '${component3.name}'`,
              }
            );

            expect(validateComponents.bind(null, files, callback)).to.not.throw();
          });
        });
      });

      it('should throw an error if the component.elements is not a function', function() {
        component3.elements = {};
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The elements property must be a function for component ${component3.name}`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The elements property must be a function for component component3`
        );
      });

      it('should throw an error if the component.model is not a function', function() {
        component3.model = 'im a string';
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The model property must be a function for component ${component3.name}`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The model property must be a function for component component3`
        );
      });

      it('should throw an error if the component.actions is not a function', function() {
        delete component3.actions;
        mockery.registerMock('path/to/file3.js', component3);
        validateComponents = require('../../../../../lib/util/validators/validate-components.js');
        MbttError.COMPONENT.COMPONENT_TYPE_ERROR.throws(
          {message: `The actions property must be a function for component ${component3.name}`}
        );

        expect(validateComponents.bind(null, files, callback)).to.throw(
          `The actions property must be a function for component component3`
        );
      });
    });
  });
});
