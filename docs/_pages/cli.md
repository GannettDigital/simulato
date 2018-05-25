---
permalink: /cli/
title: 'CLI'
toc_label: 'CLI'
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
    * `-c`, `--components` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-r`, `--reporter`
        * Specify a reporter to use. Either `basic` or `teamcity` 
        * Default is `basic`
        * Example: `-r teamcity`
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

## generate
* Description
    * Generates tests using the supplied components
* Example Usage
    * `model-based-test-tool generate -c ./components -o ./tests -t actionFocused`
* Options
    * `-c`, `--components` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-o`, `--outputPath`
        * The path wherein to write the generated test cases
        * Default is the current working directory
        * Example `-o ./tests` 
    * `-t`, `--technique` **required**
        * The test generation technique
        * The only and required option at this point is `actionFocused`
        * Example: `-t actionFocused`
    * `-a`, `--actionToCover`
        *  The single action to generate a test to cover
        *  Example: `-a myComponent.MY_ACTION`
    * `-f`, `--configFile`
        * Path to configFile
        * Example: `-f ./config.js`
