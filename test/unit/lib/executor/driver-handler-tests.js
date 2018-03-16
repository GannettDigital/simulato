'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/driver-handler.js', function() {
    describe('on file being require', function() {
        let Saucelabs;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

            Saucelabs = sinon.stub();

            mockery.registerMock('selenium-webdriver', {});
            mockery.registerMock('saucelabs', Saucelabs);
        });

        afterEach(function() {
            delete process.env.SAUCE_USERNAME;
            delete process.env.SAUCE_ACCESS_KEY;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call Saucelabs once with an object with the sauce username and password', function() {
            process.env.SAUCE_USERNAME = 'sauceUsername';
            process.env.SAUCE_ACCESS_KEY = 'sauceAccessKey';

            require('../../../../lib/executor/driver-handler.js');

            expect(Saucelabs.args).to.deep.equal([
                [{
                    username: 'sauceUsername',
                    password: 'sauceAccessKey',
                }],
            ]);
        });
    });

    describe('locally', function() {
        let webdriver;
        let webdriverBuilder;
        let driverHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

            webdriver = {
                Builder: sinon.stub(),
            };
            webdriverBuilder = {
                forBrowser: sinon.stub(),
                build: sinon.stub(),
            };
            webdriver.Builder.returns(webdriverBuilder);
            webdriverBuilder.forBrowser.returns(webdriverBuilder);
            webdriverBuilder.build.returns('myDriver');

            mockery.registerMock('selenium-webdriver', webdriver);
            mockery.registerMock('saucelabs', sinon.stub());

            driverHandler = require('../../../../lib/executor/driver-handler.js');
        });

        afterEach(function() {
            delete global.driver;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should webdriver.Builder once with no parameters', function() {
            driverHandler.locally();

            expect(webdriver.Builder.args).to.deep.equal([[]]);
        });

        it('should call webdriverBuilder.forBrowser once with the string \'chrome\'', function() {
            driverHandler.locally();

            expect(webdriverBuilder.forBrowser.args).to.deep.equal([['chrome']]);
        });

        it('should call webdriverBuilder.build once with no parameters', function() {
            driverHandler.locally();

            expect(webdriverBuilder.build.args).to.deep.equal([[]]);
        });

        it('should set global.driver to the value returned by webdriverBuilder.build', function() {
            driverHandler.locally();

            expect(global.driver).to.equal('myDriver');
        });
    });

    describe('inSaucelabs', function() {
        let webdriver;
        let webdriverBuilder;
        let driverHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

            webdriver = {
                Builder: sinon.stub(),
            };
            webdriverBuilder = {
                withCapabilities: sinon.stub(),
                usingServer: sinon.stub(),
                build: sinon.stub(),
            };
            webdriver.Builder.returns(webdriverBuilder);
            webdriverBuilder.withCapabilities.returns(webdriverBuilder);
            webdriverBuilder.usingServer.returns(webdriverBuilder);
            webdriverBuilder.build.returns('myDriver');
            process.env.TEST_NAME = 'my-test.json';
            process.env.SAUCE_USERNAME = 'sauceUsername';
            process.env.SAUCE_ACCESS_KEY = 'sauceAccessKey';
            process.env.BUILD_NUMBER = 'buildNumber';
            process.env.RELEASE_VERSION = 'releaseVersion';
            process.env.COMMIT_HASH = 'commitHash';
            process.env.NODE_ENV = 'test';
            process.env.TUNNEL_IDENTIFIER = 'mbtt-tunnel';

            mockery.registerMock('selenium-webdriver', webdriver);
            mockery.registerMock('saucelabs', sinon.stub());

            driverHandler = require('../../../../lib/executor/driver-handler.js');
        });

        afterEach(function() {
            delete global.driver;
            delete process.env.TEST_NAME;
            delete process.env.SAUCE_USERNAME;
            delete process.env.SAUCE_ACCESS_KEY;
            delete process.env.BUILD_NUMBER;
            delete process.env.RELEASE_VERSION;
            delete process.env.COMMIT_HASH;
            delete process.env.NODE_ENV;
            delete process.env.TUNNEL_IDENTIFIER;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call webdriver.Builder once with the no parameters', function() {
            driverHandler.inSaucelabs();

            expect(webdriver.Builder.args).to.deep.equal([[]]);
        });

        it('should call webdriverBuilder.withCapabilities once with the config object', function() {
            driverHandler.inSaucelabs();

            expect(webdriverBuilder.withCapabilities.args).to.deep.equal([
                [
                    {
                        'name': 'my-test.json',
                        'browserName': 'chrome',
                        'platform': 'Windows 10',
                        'version': '63.0',
                        'username': 'sauceUsername',
                        'accessKey': 'sauceAccessKey',
                        'tunnel-identifier': 'mbtt-tunnel',
                        'customData': {
                            build: 'buildNumber',
                            release: 'releaseVersion',
                            commithash: 'commitHash',
                            environment: 'test',
                        },
                    },
                ],
            ]);
        });

        it('should call webdriverBuilder.usingServer once with the url', function() {
            driverHandler.inSaucelabs();

            expect(webdriverBuilder.usingServer.args).to.deep.equal([
                ['http://sauceUsername:sauceAccessKey@ondemand.saucelabs.com:80/wd/hub'],
            ]);
        });

        it('should call webdriverBuilder.build once with no parameters', function() {
            driverHandler.inSaucelabs();

            expect(webdriverBuilder.build.args).to.deep.equal([[]]);
        });

        it('should set global.driver to the value returned by webdriverBuilder.build', function() {
            driverHandler.inSaucelabs();

            expect(global.driver).to.equal('myDriver');
        });
    });

    describe('handleError', function() {
        let driverHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

            mockery.registerMock('selenium-webdriver', {});
            mockery.registerMock('saucelabs', sinon.stub());

            driverHandler = require('../../../../lib/executor/driver-handler.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set driverHandler._failed to the boolean true', function() {
            driverHandler.handleError();

            expect(driverHandler._failed).to.equal(true);
        });
    });

    describe('quit', function() {
        let Saucelabs;
        let saucelabsApi;
        let driverHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/driver-handler.js');

            global.driver = {
                getSession: sinon.stub(),
                then: sinon.stub(),
                quit: sinon.stub(),
            };
            saucelabsApi = {
                updateJob: sinon.stub(),
            };
            Saucelabs = sinon.stub().returns(saucelabsApi);
            driver.getSession.returns(driver);

            mockery.registerMock('selenium-webdriver', {});
            mockery.registerMock('saucelabs', Saucelabs);

            driverHandler = require('../../../../lib/executor/driver-handler.js');
        });

        afterEach(function() {
            delete global.driver;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call driver.getSession once with no parameters', function() {
            driverHandler.quit();

            expect(driver.getSession.args).to.deep.equal([[]]);
        });

        describe('when the driver.getSession().then callback is called', function() {
            it('should set driver.sessionID the passed in session.id_', function() {
                driver.then.callsArgWith(0, {id_: 'mySessionId'});

                driverHandler.quit();

                expect(driver.sessionID).to.equal('mySessionId');
            });

            it('should call saucelabsApi.updateJob once', function() {
                driver.then.callsArgWith(0, {id_: 'mySessionId'});

                driverHandler.quit();

                expect(saucelabsApi.updateJob.callCount).to.equal(1);
            });

            it('should call saucelabsApi.updateJob the driver.sessionID and an object with passed' +
                'set to to negation driverHandler._failed', function() {
                driverHandler._failed = false;
                driver.then.callsArgWith(0, {id_: 'mySessionId'});

                driverHandler.quit();

                expect(saucelabsApi.updateJob.args[0].slice(0, 2)).to.deep.equal([
                    'mySessionId',
                    {passed: true},
                ]);
            });

            describe('when the the saucelabsApi.updateJob callback is called', function() {
                it('should call driver.quit once with no parameters', function() {
                    driver.then.callsArgWith(0, {id_: 'mySessionId'});
                    saucelabsApi.updateJob.callsArg(2);

                    driverHandler.quit();

                    expect(driver.quit.args).to.deep.equal([[]]);
                });
            });
        });
    });
});