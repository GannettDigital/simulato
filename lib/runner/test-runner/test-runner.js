'use strict';

const childProcess = require('child_process');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const configHandler = require('../../util/config-handler.js');

let testRunner;

module.exports = testRunner = {
    _testsRunning: 0,
    _parallelism: null,
    _testFiles: [],
    _testNumbers: {},
    _testTimer: null,
    _timeToStartNextTest: Date.now(),
    _staggerTime: null,
    _testsRemaining: null,
    _testsToRerun: [],
    _rerunCount: null,
    configure(testFiles) {
        testRunner._testTimer = process.hrtime();
        testRunner._testFiles = testFiles;
        testRunner._testsRemaining = testFiles.length;
        testRunner._staggerTime = configHandler.get('testDelay');
        testRunner._rerunCount = configHandler.get('rerunFailedTests');
        testRunner._parallelism = configHandler.get('parallelism');
        testRunner.emit('testRunner.configured');
    },
    _startTest(spawnArgs, testPath) {
        let env = _.cloneDeep(process.env);
        env.PARENT_CONFIG = JSON.stringify(configHandler.getAll());
        env.USING_PARENT_TEST_RUNNER = true;
        env.TEST_PATH = testPath;

        let test = childProcess.spawn('node', spawnArgs, {
            env,
            stdio: [null, null, null, 'ipc'],
        });

        test.name = testPath.split('\\').pop().split('/').pop();

        testRunner._testNumbers.hasOwnProperty(test.name) ?
        test.number = testRunner._testNumbers[test.name] :
        testRunner._testNumbers[test.name] = test.number = Object.keys(testRunner._testNumbers).length;

        test.testPath = testPath;

        testRunner._testsRunning++;

        test.stderr.on('data', function(data) {
            testRunner.emit('testRunner.childStderrReceived', data, test.number);
        });

        test.on('message', function(data) {
            testRunner.emit('testRunner.testDataReceived', data, test.number);
        });

        test.on('close', function(exitCode) {
            if (exitCode) {
                if (testRunner._rerunCount === 0) {
                    process.exitCode = 1;
                }
                testRunner._testsToRerun.push(test.testPath);
            }
            testRunner._testsRunning--;
            testRunner._testsRemaining--;
            testRunner.emit('testRunner.testFinished', test.number, testRunner._rerunCount);
            if (testRunner._testsRemaining === 0) {
                if (testRunner._testsToRerun.length === 0 || testRunner._rerunCount === 0) {
                    testRunner.emit('testRunner.done');
                } else {
                    testRunner.emit('testRunner.rerunTestsReadyToConfigure');
                }
            }
        });

        testRunner.emit('testRunner.testStarted', test.number, test.name);
    },
    _configureRerun() {
        testRunner._rerunCount--;
        testRunner._testFiles = testRunner._testsToRerun;
        testRunner._testsToRerun = [];
        testRunner._testsRemaining = testRunner._testFiles.length;
        testRunner.emit('testRunner.configured');
    },
    _scheduleTests() {
        let numberOfTestsToStart = testRunner._parallelism - testRunner._testsRunning;
        for (let i = 0; i < numberOfTestsToStart; i++) {
            let testFile = testRunner._testFiles.pop();
            if (testFile) {
                let now = Date.now();
                if (now >= testRunner._timeToStartNextTest) {
                    testRunner._timeToStartNextTest = now + testRunner._staggerTime;
                    testRunner.emit('testRunner.testScheduled', testFile);
                } else {
                    setTimeout(function() {
                        testRunner.emit('testRunner.testScheduled', testFile);
                    }, testRunner._timeToStartNextTest - now);
                    testRunner._timeToStartNextTest += testRunner._staggerTime;
                }
            } else {
                break;
            }
        }
    },
    _createSpawnArgs(testPath) {
        let spawnArgs = [
            path.resolve(__dirname, '../../../index.js'),
            'run',
        ];

        if (configHandler.get('debug')) {
            testRunner.emit('testRunner.getDebugPort', function(port) {
                spawnArgs.unshift(`--inspect-brk=${port}`);
                testRunner.emit('testRunner.spawnArgsCreated', spawnArgs, testPath);
            });
        } else {
            testRunner.emit('testRunner.spawnArgsCreated', spawnArgs, testPath);
        }
    },
};

Object.setPrototypeOf(testRunner, new EventEmitter());

testRunner.on('testRunner.configured', testRunner._scheduleTests);
testRunner.on('testRunner.testFinished', testRunner._scheduleTests);
testRunner.on('testRunner.testScheduled', testRunner._createSpawnArgs);
testRunner.on('testRunner.spawnArgsCreated', testRunner._startTest);
testRunner.on('testRunner.rerunTestsReadyToConfigure', testRunner._configureRerun);
