'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/validate-children.js', function() {
    let validateChildren;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/util/validators/validate-children.js');

        global.MbttError = {
            CHILD: {
                CHILDREN_NOT_ARRAY: sinon.stub(),
                CHILD_NOT_OBJECT: sinon.stub(),
                CHILD_OBJECT_PROPERTY_TYPE: sinon.stub(),
            },
        };

        validateChildren = require('../../../../../lib/util/validators/validate-children.js');
    });

    afterEach(function() {
        delete global.MbttError;
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('if the passed in children is valid', function() {
        it('should should not throw', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: 'myInstance2',
                    state: {
                        property: 'value2',
                    },
                },
            ];

            expect(validateChildren.bind(null, children, '', '')).to.not.throw();
        });
    });

    describe('if the passed in children is not an array', function() {
        it('should throw an error', function() {
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILDREN_NOT_ARRAY.throws(error);

            expect(validateChildren.bind(null, '', '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILDREN_NOT_ARRAY once with an error message', function() {
            try {
                validateChildren('', 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILDREN_NOT_ARRAY.args).to.deep.equal([
                [`Children for 'myInstance' were not returned as an Array by parent component 'myComponent'`],
            ]);
        });
    });

    describe('if the passed in children has an entry that is not an object', function() {
        it('should throw an error', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                'Not an object',
            ];
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILD_NOT_OBJECT.throws(error);

            expect(validateChildren.bind(null, children, '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILD_NOT_OBJECT once with an error message', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                'Not an object',
            ];

            try {
                validateChildren(children, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILD_NOT_OBJECT.args).to.deep.equal([
                [`Child of children array at index '1' for component 'myComponent' must be an object`],
            ]);
        });
    });

    describe('if a child \'componentName\' property is not a string', function() {
        it('should throw an error', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: undefined,
                    instanceName: 'myInstance2',
                    state: {
                        property: 'value2',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea2',
                    },
                },
            ];
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateChildren.bind(null, children, '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: undefined,
                    instanceName: 'myInstance2',
                    state: {
                        property: 'value2',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea2',
                    },
                },
            ];

            try {
                validateChildren(children, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'componentName' property of child at index '1' for component 'myComponent' ` +
                    `must be a string. Found 'undefined'`,
                ],
            ]);
        });
    });

    describe('if a child \'instanceName\' property is not a string', function() {
        it('should throw an error', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: undefined,
                    state: {
                        property: 'value2',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
            ];
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateChildren.bind(null, children, '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent',
                    instanceName: undefined,
                    state: {
                        property: 'value2',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea2',
                    },
                },
            ];

            try {
                validateChildren(children, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'instanceName' property of child at index '1' for component 'myComponent' ` +
                    `must be a string. Found 'undefined'`,
                ],
            ]);
        });
    });

    describe('if a child \'state\' property is not an object', function() {
        it('should throw an error', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: 'myInstance2',
                    state: '',
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
            ];
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateChildren.bind(null, children, '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: 'myInstance2',
                    state: '',
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
            ];

            try {
                validateChildren(children, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'state' property of child at index '1' for component 'myComponent' ` +
                    `must be an object. Found ''`,
                ],
            ]);
        });
    });

    describe('if a child \'options\' property is defined and not an object', function() {
        it('should throw an error', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: 'myInstance2',
                    state: {
                        property: 'value2',
                    },
                    options: '',
                },
            ];
            let error = new Error('An error occurred!');
            MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.throws(error);

            expect(validateChildren.bind(null, children, '', '')).to.throw('An error occurred!');
        });

        it('should call MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE once with an error message', function() {
            let children = [
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {
                        property: 'value',
                    },
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                },
                {
                    componentName: 'myComponent2',
                    instanceName: 'myInstance2',
                    state: {
                        property: 'value2',
                    },
                    options: '',
                },
            ];

            try {
                validateChildren(children, 'myInstance', 'myComponent');
            } catch (error) {}

            expect(MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE.args).to.deep.equal([
                [`The 'options' property of child at index '1' for component 'myComponent' ` +
                    `must be an object. Found ''`,
                ],
            ]);
        });
    });
});
