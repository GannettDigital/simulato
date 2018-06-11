---
permalink: /configuration-file/
title: 'Configuration File'
toc_label: 'Configuration File'
---

This section documents utilization of the configuration file in place of CLI options.

## Parameters

### testPath
  * Path to tests
  * Example: `testPath: ./my-test-folder`

### components
  * Path to components
  * Example: `components: /my-components-folder`

### reporter
  * Specify a reporter to use. Either `basic` or `teamcity` 
  * Default is `basic`
  * Example: `reporter: teamcity`
    
### saucelabs
  * Flag for running tests in saucelabs. A sauce tunnel will be started
  * Example: `saucelabs: true`

### sauceCapabilities
  * Object containing saucelabs configuration options
  * Can include a specified `username` for your saucelabs account
  * Can include a specified `accessKey` for your saucelabs account
  * Example: `sauceCapabilities: {'username': 'testUser', 'accessKey': 'testKey'}`
  * All other options can be found here:
  https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options

### parallelism
  *  Amount of tests to run in parallel
  *  Default is `20`
  *  Example; `parallelism: 5`

### reportPath
  * The parth wherein to write the test report
  * Example: `reportPath: ./my-reports`

### before
  * The path to a before script run before the test suite
  * Must be a valid JavaScript file that exports a single function
  * Example: `before: my-before-script.js`

### outputPath
  * The path wherein to write the generated test cases
  * Default is the current working directory
  * Example `outputPath: ./tests`

### actionToCover
  * The single action to generate a test to cover
  * Default is the current working directory
  * Example `actionToCover: myComponent.MY_ACTION`

### testDelay
  * Number of milliseconds to stagger test execution
  * Default is `200`
  * Example: `testDelay: 400`

### rerunFailedTests
  * Number of times to rerun failedTests
  * Default is `0`
  * Example: `rerunFailedTests: 2`

### planner.algorithm
  * The algorithm to use when the planner generates tests
  * Supported algorithms: `forwardStateSpaceSearchHeuristic`
  * Example: `algorithm: forwardStateSpaceSearchHeuristic`

## Example File
    'use strict'

    module.exports = {
        testPath: './test/acceptance/tests',
        components: './test/acceptance/components',
        reportPath: './test/acceptance/tests',
        saucelabs: true,
        sauceCapabilities: {'username': 'testUser', 'accessKey': 'testKey'},
        outputPath: './test/acceptance/tests',
        planner: {
          algorithm: `forwardStateSpaceSearchHeuristic`
        }
    }