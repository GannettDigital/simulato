---
permalink: /documentation/configuration-file/
title: 'Configuration File'
toc: false
classes: wide
sidebar: docs_sidebar
---

This section documents utilization of the configuration file in place of CLI options.

## Parameters

### testPath
  * Path to tests
  * Example: `testPath: './my-test-folder'`

### componentPath
  * Path to components
  * Example: `componentPath: './my-components-folder'`

### reporter
  * Specify a reporter to use.
  * Default is `basic`
  * Values Allowed: `basic`
  * Example: `reporter: 'basic'`

### driver
  * Use to customize the selenium driver
  * See [driver configuration](#driver-configuration)
  * Example: `driver: {<CUSTOM DRIVER CAPABILITIES>}`

### sauce connect arguments
  * Use to pass options to the embedded suace connect tunnel
  * documentation for options can be found [here](https://www.npmjs.com/package/sauce-connect-launcher)
  * some quality of life changes have been made as well
    * 'verbose' will be set if 'v' or 'vv' is passed
    *  a default logger is set if verbose mode is set
  * Example: `sauceConnectArgs: {<CUSTOM SAUCE ARGUMENTS>}`

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
  * Values Allowed: `JSON`, `actionJSON`, `JUnit`
  * Example: `reportFormat: 'JSON'`

### deferFailureReports
  * Whether or not to wait until all tests are finished to show test failure reports
  * When paralellism is set to zero, this has no effect
  * Default is `false`
  * Example: `deferFailureReports: true`

### jUnitReportSpecificity
  * The levels of detail
  * Default value is `testReport`
  * Values Allowed: `testReport`, `testRun`, `action`
    * `testReport`
      * Creates a test case for each test file (reruns excluded)
      * Sets the time of the test as the sum of the time of all executions for that test file
        * A test that was run 3 times, 2 reruns taking 3 seconds each and 1 passing taking 5 seoncds, would produce a single test case in the report with a time of 11 seconds
    * `testRun`
      * Creates a test case for each test run (reruns included)
    * `action`
      * Creates a test case for each action executed (reruns included)
  * Example: `jUnitReportSpecificity: testReport`

### reportStates
  * Toggle on/off adding the `expectedState` property of all actions within the effects step of the report. When `true`, `expectedState` property will always be added into the effects step. Note: By default, `expectedState` and `pageState` will always be added on an `effects` step failure regardless of the reportStates flag.
  * Default value is `false`
  * Values Allows: `true`, `false`
  * Example: `reportStates: true`
  * Sample Report:

```
{
  ...
  actions: [
    {
      ...
      steps: {
        effects: {
          "status": "pass",
          "time": [
            0,
            8398883
          ],
          "error": null,
          "expectedState": {
            newsArticle1: {
              displayed: true
              headingText: {
                displayed: true
              },
              text: {
                diplayed: true
              }
            }
          }
        }
        ...
      }
    }
  ]
  ...
}
```

### reportPreconditions
  * Toggle on/off adding the `conditions` property inside of all actions within the preconditions step of the report. When `true`, `conditions` will always be displayed into the preconditions object. In addition, on precondition failure, the pageState will be added into the preconditions object as well. (see below sample)
  * Default value is `false`
  * Values Allows: `true`, `false`
  * Example: `reportPreconditions: true`
  * Sample Report: 

```
{
  ...
  actions: [
    {
      ...
      steps: {
        preconditions: {
          "status": "fail",
          "time": [
            0,
            8398883
          ],
          "error": null,
          "conditions": [
            [
              "isTrue",
              "pageState.newsArticle1.displayed"
            ],
            [
              "property",
              "dataStore",
              "newsArticle1HeadingText"
            ],
            [
              "property",
              "dataStore",
              "newsArticle1Text"
            ]
          ]
          "pageState": {
            newsArticle1: {
              displayed: false
              headingText: {
                displayed: true
              },
              text: {
                diplayed: true
              }
            }
          }
        }
        ...
      }
    }
  ]
  ...
}
```

### before
  * The path to a before script run before the test suite
  * Must be a valid JavaScript file that exports a single function
  * Example: `before: './scripts/my-before-script.js'`

### outputPath
  * The path wherein to write the generated test cases
  * Default is the current working directory
  * Example `outputPath: './tests'`

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

### plannerAlgorithm
  * The algorithm to use when the planner generates tests
  * Supported algorithms: `actionTree`, `forwardStateSpaceSearchHeuristic`
  * Example: `algorithm: forwardStateSpaceSearchHeuristic`

### plannerTestLength
  * The maximum test length for a generated test
  * Using this option will initiate a replanning step to ensure tests conform to this
  * The replanning step will most likely greatly reduce the number of generated tests
  * Example: `plannerTestLength: 75`

### replanningSeed
  * Seed provided to the replanning algorithm's random number generator
  * Using seeded random numbers allows for consisten plans between generation runs
  * If replanning is not enabled with `plannerTestLength`, this value has no effect
  * Example: `replanningSeed: 867.5309`

### debug
  * Adds node debugging flag to spawned child processes
  * Default is `false`
  * Example: `debug: true`
    
### debugPort
  * Specifies the port to start on when using `--debug`
  * Default is `32489`
  * Example: `debugPort: 5072`

## Driver Configuration

Custom Selenium driver configurations can be passed in using the driver property of the configuration file.  Currently supported is passing in custom capabilities, custom server, and turning on and off saucelabs functionallity. Please note, if you need to call `forBrowser`, please use `browserName`, and the optional `version` properties inside capabilities.

### capabilities
  * Sets custom selenium driver capabilities by calling [withCapabilities](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Builder.html#withCapabilities) passing in custom capabilities
  * Defaults to `browserName: 'chrome'`
  * Example: `driver: { browserName: 'firefox', version: 'latest' }`

### usingServer
  * Sets custom selenium server by calling [usingServer](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Builder.html#usingServer) passing in custom server string
  * Defaults to localhost
  * Example: `driver: { usingServer: 'http://www.myCustomServer.com}`

### saucelabs
  * Sets simulato to use saucelabs
  * Defaults to `saucelabs: false`
  * Example: `driver: { saucelabs: true }`
  * Notes:
    * When using saucelabs, default capabiltities will be set for you:
      * name - pregenerated test name
      * browserName - 'chrome'
      * version - 'latest'
      * platform - 'Windows 10',
      * username - username set in `process.env.SAUCE_USERNAME`
      * accessKey - username set in `process.env.SAUCE_ACCESS_KEY`
      * tunnel-identifier - pregenerated tunnel name, unique to test suite execution
    * usingServer will default to `http://<SAUCE_USERNAME>:<SAUCE_ACCESS_KEY>@ondemand.saucelabs.com:80/wd/hub`
    * All defaults can be overwritten using custom capabilities/custom usingServer.

## Example File
    'use strict'

    module.exports = {
        testPath: './test/acceptance/tests',
        componentPath: './test/acceptance/components',
        reportPath: './test/acceptance/tests',
        driver: {
          saucelabs: true,
          capabilities: {
            browserName: 'firefox'
          }
        },
        outputPath: './test/acceptance/tests',
        plannerAlgorithm: `forwardStateSpaceSearchHeuristic`
    }

