---
permalink: /configuration-file/
title: 'Configuration File'
toc_label: 'Configuration File'
---

This section documents utilization of the configuration file in place of CLI options.

## Parameters

### testPath
  * Path to tests
  * Example: `testPath: './my-test-folder'`

### componentPath
  * Path to components
  * Example: `componentPath: '/my-components-folder'`

### reporter
  * Specify a reporter to use.
  * Default is `basic`
  * Values Allowed: `basic`
  * Example: `reporter: 'basic'`
    
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
  * Example: `reportPath: './my-reports'`

### reportFormat
  * The format in which to write the test reports in
  * Default is `JSON`
  * Values Allowed: `JSON`
  * Example: `reportFormat: 'JSON'`

### before
  * The path to a before script run before the test suite
  * Must be a valid JavaScript file that exports a single function
  * Example: `before: './scripts/my-before-script.js'`

### outputPath
  * The path wherein to write the generated test cases
  * Default is the current working directory
  * Example `outputPath: './tests'`

### technique
  * The test generation technique
  * The only and required option at this point is actionFocused
  * Example `technique: 'actionFocused'`

### actionToCover
  * The single action to generate a test to cover
  * Default is the current working directory
  * Example `actionToCover: 'myComponent.MY_ACTION'`

### testDelay
  * Number of milliseconds to stagger test execution
  * Default is `200`
  * Example: `testDelay: 400`

### rerunFailedTests
  * Number of times to rerun failedTests
  * Default is `0`
  * Example: `rerunFailedTests: 2`

### debug
  * Adds node debugging flag to spawned child processes
  * Default is `false`
  * Example: `debug: true`
    
### debugPort
  * Specifies the port to start on when using `--debug`
  * Default is `32489`
  * Example: `debugPort: 5072`

## Example File
    'use strict'

    module.exports = {
        testPath: './test/acceptance/tests',
        componentPath: './test/acceptance/components',
        reportPath: './test/acceptance/tests',
        saucelabs: true,
        sauceCapabilities: {'username': 'testUser', 'accessKey': 'testKey'},
        outputPath: './test/acceptance/tests',
        technique: 'actionFocused',
    }