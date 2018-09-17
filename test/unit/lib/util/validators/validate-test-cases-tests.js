'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-test-cases.js', function() {
  describe('on file being required', function() {
    beforeEach(function() {
      mockery.enable({useCleanCache: true});

      mockery.registerMock('path', {});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-test-cases.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should export a function', function() {
      let result = require('../../../../../lib/util/validators/validate-test-cases.js');

      expect(result).to.be.a('function');
    });
  });

  describe('on exported function being executed', function() {
    let validateTestCases;
    let SimulatoError;
    let path;
    let files;
    let callback;
    let testCase1;
    let testCase3;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/util/validators/validate-test-cases.js');

      path = {
        extname: sinon.stub(),
      };

      callback = sinon.stub();

      files = [
        'path/to/file1.json',
        'path/to/file2-report.json',
        'path/to/file3.json',
      ];

      testCase1 = [
        {
          type: 'Component1',
          name: 'component1',
          state: {},
        },
        {
          name: 'component1.ACTION_A',
        },
        {
          name: 'component2.ACTION_B',
        },
      ];

      testCase3 = [
        {
          type: 'Component1',
          name: 'component1',
          state: {},
        },
        {
          name: 'component1.ACTION_A',
        },
        {
          name: 'component3.ACTION_C',
        },
        {
          name: 'component4.ACTION_D',
        },
      ];

      path.extname.onCall(0).returns('.json');
      path.extname.onCall(1).returns('');
      path.extname.onCall(2).returns('.json');

      sinon.spy(files, 'filter');

      SimulatoError = {
        TEST_CASE: {
          FILE_TYPE_ERROR: sinon.stub(),
          TEST_CASE_NOT_ARRAY: sinon.stub(),
          TEST_CASE_TYPE_ERROR: sinon.stub(),
        },
      };
      global.SimulatoError = SimulatoError;

      mockery.registerMock('path', path);
      mockery.registerMock('path/to/file1.json', testCase1);
    });

    afterEach(function() {
      delete global.SimulatoError;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });
    it('should call filter on the passed in files', function() {
      mockery.registerMock('path/to/file3.json', testCase3);
      validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');

      validateTestCases(files, callback);

      expect(files.filter.callCount).to.equal(1);
    });

    describe('when the callback on the files filter function is called', function() {
      it('should call path.extname with file passed in for each file in files', function() {
        mockery.registerMock('path/to/file3.json', testCase3);
        validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');

        validateTestCases(files, callback);

        expect(path.extname.args).to.deep.equal([
          ['path/to/file1.json'],
          ['path/to/file2-report.json'],
          ['path/to/file3.json'],
        ]);
      });

      describe('when callback is called', function() {
        it('should filter out every file that ends in report.json and set files to updated array', function() {
          mockery.registerMock('path/to/file3.json', testCase3);
          validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');

          validateTestCases(files, callback);

          expect(callback.args).to.deep.equal([
            [
              ['path/to/file1.json', 'path/to/file3.json'],
            ],
          ]);
        });

        it('should filter out every file that doesnt end in .json and set files to updated array', function() {
          mockery.registerMock('path/to/file3.json', testCase3);
          validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
          files[1] = 'path/to/file2.json';

          validateTestCases(files, callback);

          expect(callback.args).to.deep.equal([
            [
              ['path/to/file1.json', 'path/to/file3.json'],
            ],
          ]);
        });
      });
    });

    describe('for each file of the passed in files', function() {
      it('should throw an error if the file cannot be required', function() {
        mockery.registerMock('path/to/file3.json', testCase3);
        validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
        files.push('path/to/file4.json');
        path.extname.onCall(3).returns('.json');
        mockery.registerAllowable('path/to/file4.json');

        expect(validateTestCases.bind(null, files, callback)).to.throw(`The test case at path 'path/to/file4.json' `+
         `was unable to be loaded for reason 'Cannot find module 'path/to/file4.json'`);
      });

      it('should throw an error if the test case is not an Array', function() {
        testCase3 = {key: 'im not an array'};
        mockery.registerMock('path/to/file3.json', testCase3);
        validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
        SimulatoError.TEST_CASE.TEST_CASE_NOT_ARRAY.throws(
            {message: `The test case at path ${files[2]} must be an Array`}
        );

        expect(validateTestCases.bind(null, files, callback)).to.throw(
            `The test case at path path/to/file3.json must be an Array`
        );
      });

      describe('for each action inside the test case array', function() {
        it('should throw an error if the action is not an object', function() {
          testCase3[0] = [];
          mockery.registerMock('path/to/file3.json', testCase3);
          validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
          SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR.throws(
              {message: `The test case at file path ${files[2]} array index 0 must be an object`}
          );

          expect(validateTestCases.bind(null, files, callback)).to.throw(
              `The test case at file path path/to/file3.json array index 0 must be an object`
          );
        });

        it('should throw an error if the action name is not string', function() {
          delete testCase3[0].name;
          mockery.registerMock('path/to/file3.json', testCase3);
          validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
          SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR.throws(
              {message: `The test case at file path ${files[2]} array index 0 name value must be a string`}
          );

          expect(validateTestCases.bind(null, files, callback)).to.throw(
              `The test case at file path path/to/file3.json array index 0 name value must be a string`
          );
        });

        describe('if the action is the first action', function() {
          it('should throw an error if the action.type is not string', function() {
            testCase3[0].type = ['i', 'am', 'not', 'a', 'string'];
            mockery.registerMock('path/to/file3.json', testCase3);
            validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
            SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR.throws(
                {
                  message:
                  `The test case at file path ${files[2]} action initialization must`
                  + ` have a name thats a string`,
                }
            );

            expect(validateTestCases.bind(null, files, callback)).to.throw(
                `The test case at file path path/to/file3.json action initialization must`
              + ` have a name thats a string`
            );
          });

          it('should throw an error if the action.name is not string', function() {
            delete testCase3[0].name;
            mockery.registerMock('path/to/file3.json', testCase3);
            validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
            SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR.throws(
                {
                  message:
                  `The test case at file path ${files[2]} action initialization must`
                  + ` have a name thats a string`,
                }
            );

            expect(validateTestCases.bind(null, files, callback)).to.throw(
                `The test case at file path path/to/file3.json action initialization must`
              + ` have a name thats a string`
            );
          });

          it('should throw an error if the action.state is not an object', function() {
            testCase3[0].state = [];
            mockery.registerMock('path/to/file3.json', testCase3);
            validateTestCases = require('../../../../../lib/util/validators/validate-test-cases.js');
            SimulatoError.TEST_CASE.TEST_CASE_TYPE_ERROR.throws(
                {
                  message:
                  `The test case at file path ${files[2]} action initialization must`
                  + ` have a state thats an object`,
                }
            );

            expect(validateTestCases.bind(null, files, callback)).to.throw(
                `The test case at file path path/to/file3.json action initialization must`
              + ` have a state thats an object`
            );
          });
        });
      });
    });
  });
});
