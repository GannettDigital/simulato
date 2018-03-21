'use strict';

const childProcess = require('child_process');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

let testRunner;

module.exports = testRunner = {
    _testsRunning: 0,
    _parallelism: 20,
    _testFiles: [],
    _testCount: 0,
    _testTimer: null,

    configure(testFiles, parallelism) {
        testRunner._testTimer = process.hrtime();
        testRunner._testFiles = testFiles;
        if (parallelism && parallelism > 0) {
            testRunner._parallelism = parallelism;
        }
        testRunner.emit('testRunner.configured');
    },
    _startTest(spawnArgs) {
        let env = _.cloneDeep(process.env);
        env.USING_PARENT_TEST_RUNNER = true;
        let test = childProcess.spawn('node', spawnArgs, {
            env,
            stdio: [null, null, null, 'ipc'],
        });

        test.number = testRunner._testCount;
        testRunner._testCount++;
        testRunner._testsRunning++;

        test.stdout.on('data', function(data) {
            testRunner.emit('testRunner.childStdoutReceived', data, test.number);
        });
        test.stderr.on('data', function(data) {
            testRunner.emit('testRunner.childStderrReceived', data, test.number);
        });

        test.on('message', function(data) {
            testRunner.emit('testRunner.testDataReceived', data);
        });

        test.on('close', function() {
            testRunner._testsRunning--;
            testRunner.emit('testRunner.testFinished');
            if (testRunner._testsRunning === 0) {
                testRunner.emit('testRunner.done');
            }
        });

        testRunner.emit('testRunner.testStarted', test.number);
    },
    _scheduleTests() {
        let numberOfTestsToStart = testRunner._parallelism - testRunner._testsRunning;

        for (let i = 0; i < numberOfTestsToStart; i++) {
            let testFile = testRunner._testFiles.pop();
            if (testFile) {
                testRunner.emit('testRunner.testScheduled', testFile);
            } else {
                break;
            }
        }
    },
    _createSpawnArgs(testPath) {
        let spawnArgs = [
            path.resolve(__dirname, '../../../index.js'),
            'run',
            '-T',
            testPath,
            '-c',
            process.env.COMPONENTS_PATH,
        ];

        if (process.env.REPORTER) {
            spawnArgs.push('-r');
            spawnArgs.push(process.env.REPORTER);
        }

        if (process.env.OUTPUT_PATH) {
            spawnArgs.push('-R');
            spawnArgs.push(process.env.OUTPUT_PATH);
        }

        if (process.env.SAUCE_LABS) {
            spawnArgs.push('-s');
        }

        if (process.env.CONFIG_FILE) {
            spawnArgs.push('-f');
            spawnArgs.push(process.env.CONFIG_FILE);
        }

        testRunner.emit('testRunner.spawnArgsCreated', spawnArgs);
    },
};

Object.setPrototypeOf(testRunner, new EventEmitter());

testRunner.on('testRunner.configured', testRunner._scheduleTests);
testRunner.on('testRunner.testFinished', testRunner._scheduleTests);
testRunner.on('testRunner.testScheduled', testRunner._createSpawnArgs);
testRunner.on('testRunner.spawnArgsCreated', testRunner._startTest);
