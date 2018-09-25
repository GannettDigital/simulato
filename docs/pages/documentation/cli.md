---
permalink: /documentation/cli/
title: 'CLI'
toc: false
classes: wide
sidebar: docs_sidebar
---

This section details the different commands used in the CLI. All passed in CLI options override any set inside the configuration file

## run
* Description
    * Runs the tests in the folder paths specified
* Example usage
    * `model-based-test-tool run -T ./tests -c ./components -o ./tests`
* Options
    * `-T`, `--testPath` **required**
        * Path to tests
        * Example: `-T ./my-test-folder`
    * `-c`, `--componentPath` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-r`, `--reporter`
        * Specify a reporter to use
        * Default is `basic`
        * Values Allowed: `basic`
        * Example: `-r basic`
    * `-s`, `--saucelabs`
        * Flag for running tests in saucelabs. A sauce tunnel will be started
        * Must have `SAUCE_USERNAME` AND `SAUCE_ACCESS_KEY` specified
        * Example: `-s`
    * `-p`, `--parallelism`
        *  Amount of tests to run in parallel
        *  Default is `20`
        *  Example; `-p 5`
    * `-R`, `--reportPath`
        * The path wherein to write the test report
        * Example: `-o ./my-reports`
    * `-J`, `--reportFormat`
        * The format in which to write the test reports in
        * Default is `JSON`
        * Values Allowed: `JSON`
        * Example: `-J JSON`
    * `-b`, `--before`
        * The path to a before script run before the test suite
        * Must be a valid JavaScript file that exports a single function
        * Example: `-b my-before-script.js`
    * `-f`, `--configFile`
        * Path to configFile
        * Example: `-f ./config.js`
    * `-d`, `--testDelay`
        * Number of milliseconds to stagger test execution
        * Default is `200`
        * Example: `-d 1000`
    * `-F`, `--rerunFailedTests`
        * Number of times to rerun failedTests
        * Default is `0`
        * Example: `-F 2`
    * `-D`, `--debug`
        * Adds node debugging flag to spawned child processes
        * Default is `false`
        * Example: `-D true`
    * `-P`, `--debugPort`
        * Specifies the port to start on when using `--debug`
        * Default is `32489`
        * Example: `-P 5072`

## generate
* Description
    * Generates tests using the supplied components
* Example Usage
    * `model-based-test-tool generate -c ./components -o ./tests -t actionFocused`
* Options
    * `-c`, `--componentPath` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-o`, `--outputPath`
        * The path wherein to write the generated test cases
        * Default is the current working directory
        * Example `-o ./tests` 
    * `-a`, `--actionToCover`
        *  The single action to generate a test to cover
        *  Example: `-a myComponent.MY_ACTION`
    * `-f`, `--configFile`
        * Path to configFile
        * Example: `-f ./config.js`
    * `-A`, `--plannerAlgorithm`
        * The algorithm to use when the planner generates tests
        * Supported algorithms: `forwardStateSpaceSearchHeuristic`
        * Example: `-A forwardStateSpaceSearchHeuristic`
