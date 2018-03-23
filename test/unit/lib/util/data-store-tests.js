'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/data-store', function() {
    describe('create', function() {
        let callback;
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            callback = sinon.stub();

            mockery.registerMock('lodash', {});

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call back with an object that has the DataStore as the prototype', function() {
            DataStore.create(callback);

            expect(Object.getPrototypeOf(callback.args[0][0])).to.deep.equal(DataStore);
        });

        it('should call back with object that has the \'_data\' property as an empty object', function() {
            DataStore.create(callback);

            expect(callback.args[0][0]._data).to.deep.equal({});
        });

        it('should call the passsed in callback once', function() {
            DataStore.create(callback);

            expect(callback.callCount).to.equal(1);
        });
    });

    describe('clone', function() {
        let _;
        let myThis;
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            myThis = {
                create: sinon.stub(),
            };
            _ = {
                cloneDeep: sinon.stub(),
            };

            mockery.registerMock('lodash', _);

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.create once', function() {
            DataStore.clone.call(myThis);

            expect(myThis.create.callCount).to.equal(1);
        });

        describe('when the this.create callback is called', function() {
            it('should call _.cloneDeep once with this._data', function() {
                myThis.create.callsArgWith(0, {});
                myThis._data = {
                    key: 'value',
                };

                DataStore.clone.call(myThis);

                expect(_.cloneDeep.args).to.deep.equal([
                    [
                        {
                            key: 'value',
                        },
                    ],
                ]);
            });

            it('should return an object which has a \'_data\' property equal the result of _.cloneDeep', function() {
                _.cloneDeep.returns('someClonedData');
                myThis.create.callsArgWith(0, {});

                let result = DataStore.clone.call(myThis);

                expect(result._data).to.equal('someClonedData');
            });
        });
    });

    describe('store', function() {
        let _;
        let myThis;
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            myThis = {
                _data: {},
            };
            _ = {
                cloneDeep: sinon.stub(),
            };

            mockery.registerMock('lodash', _);

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should add the passed in key as a property on this._data', function() {
            DataStore.store.call(myThis, 'myKey', 'myValue');

            expect(myThis._data).to.haveOwnProperty('myKey');
        });

        it('should set a property of this._data with the name of the passed' +
            'in key to the result of _.cloneDeep', function() {
            _.cloneDeep.returns('myValue');

            DataStore.store.call(myThis, 'myKey', 'myValue');

            expect(myThis._data.myKey).to.equal('myValue');
        });

        it('should call _.cloneDeep once with the passed in value', function() {
            DataStore.store.call(myThis, 'myKey', 'myValue');

            expect(_.cloneDeep.args).to.deep.equal([
                [
                    'myValue',
                ],
            ]);
        });
    });

    describe('retrieve', function() {
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            mockery.registerMock('lodash', {});

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should return the value that corresponds the passed in key on the object this._data', function() {
            let result = DataStore.retrieve.call({_data: {myKey: 'myValue'}}, 'myKey');

            expect(result).to.equal('myValue');
        });
    });

    describe('delete', function() {
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            mockery.registerMock('lodash', {});

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should delete the value that corresponds the passed in key on the object this._data', function() {
            let myThis = {
                _data: {
                    myKey: 'myValue',
                    myKey2: 'myValue2',
                },
            };

            DataStore.delete.call(myThis, 'myKey');

            expect(myThis._data).to.deep.equal({myKey2: 'myValue2'});
        });
    });

    describe('retrieveAndDelete', function() {
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            mockery.registerMock('lodash', {});

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should delete the value that corresponds the passed in key on the object this._data', function() {
            let myThis = {
                _data: {
                    myKey: 'myValue',
                    myKey2: 'myValue2',
                },
            };

            DataStore.retrieveAndDelete.call(myThis, 'myKey');

            expect(myThis._data).to.deep.equal({myKey2: 'myValue2'});
        });

        it('should return the value that corresponds the passed in key on the object this._data', function() {
            let myThis = {
                _data: {
                    myKey: 'myValue',
                    myKey2: 'myValue2',
                },
            };

            let result = DataStore.retrieveAndDelete.call(myThis, 'myKey');

            expect(result).to.equal('myValue');
        });
    });

    describe('retrieveAll', function() {
        let DataStore;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/data-store.js');

            mockery.registerMock('lodash', {});

            DataStore = require('../../../../lib/util/data-store.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should return this._data', function() {
            let result = DataStore.retrieveAll.call({_data: {myKey: 'myValue'}}, 'myKey');

            expect(result).to.deep.equal({myKey: 'myValue'});
        });
    });
});
