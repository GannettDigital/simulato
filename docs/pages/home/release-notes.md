---
permalink: /release-notes/
title: 'Release Notes'
toc_label: 'Version Number'
sidebar: about_sidebar
---

## 0.8.6

* Shauna Hao
  * Prepended test file name to test case name of action report for easy mapping and better debugging

## 0.8.5

* Zach Knox
  * Enabled replanning support for actionTree algorithm
  * Fixed replanning algorithm to output correctly when running with actionTree algorithm

## 0.8.4

* Raghu Dantuluri
  * Fixed generated test names to not collide, causing test overwrites
    
## 0.8.3

* Raghu Dantuluri
  * Changed generated test names to be based off the test plan;
  * Added functionality to allow user to pass sauce connect options to the embedded sauce connect tunnel;


## 0.8.2

* Raghu Dantuluri
  * Exposed 'remote' from 'selenium-webdriver' for use in test execution

## 0.8.1

* Brian  Fitzpatrick
  * Fixed bug with single action generation

## 0.8.0

* Brian  Fitzpatrick
  * Added switch for search algorithm

Scott Gunther
  * Added single search for action in action tree

* Tom Dale
  * Created action tree search for actions

## 0.7.2

* Subarna Mukhiyabeen
  * Fix endStep function to get correct expectedState for each action

## 0.7.1

* Tom Dale
  * Added flags to always show expectedstate and preconditions in report

* Scott Gunther
  * Add JUnit xml report
  * Add first version of offline replanning algorithm
  * Bug fixes for offline replanning


## 0.7.0

* Scott Gunther
  * Batch requests when getting element data

* Tom Dale
  * Rework config validation
  * Allow passing options to driver

## 0.6.5

* Subarna Mukhiyabeen
  * Added a custom writer that can generate action reports for QASymphony
  * Added unit tests for action-json-writer and updates
  * Updated unit tests for report-handler.js and index.js

## 0.6.4

* Zach Knox
  * Revamp documentation website design and structure
  * Update npmignore to not include docs

## 0.6.3

* Scott Gunther
  * Fix child process uncaught exception loop

## 0.6.2

* Tom Dale
  * Added checked property to get element data
  * Added tutorial, best practices, and more documentation

* Scott Gunther
  * Added debug flag to generate command
  * Planner prints progress after finidng each action when debug flag is set

## 0.6.1

* Brian Fitzpatrick
  * Added popping and pushing components/states by dynamic areas

* Tom Dale
  * Added ability to specify report formats
    * Supported flags: 'JSON'
    * Defaults to JSON
  * Added ability for test runner to use reporter flag
    * Supported flags: 'basic'
    * Defaults to basic

## 0.6.0

* Tom Dale
  * Added the cli/config command for debug and debugPort
  * Child processes can be spawned with --inspect-brk
  * Ports are auto assigned based on availability
  * Starting Port can be specified
  * Added new config scheme
    * cli/config/default propertys are all merged to one config
    * config is processed once at start, and availble throughout the program
    * config is validated on creation

* Scott Gunther
  * Added parent event emiiters
    * Events bubble up
  * Updated files to use new event emitters

* Brian Fitzpatrick
  * Added ability to add mutiple dynamic areas to a single component

## 0.5.2

* Tom Dale
  * Fixed a bug where the test runner would always have exit code 1 even if tests were rerun and pass
* Scott Gunther
  * Factor out creating start nodes
  * Refactor parts of planner with util emitter

## 0.5.1

* Tom Dale
  * Added action identifier to basic report for test print out errors

## 0.5.0

* Scott Gunther
  * Change searchNode.path to an array to support same action in path
  * Factor out checking of preconditions
  * Factor out apply effects
  * Change location of set operations and add a couple more

* Brian FItzpatrick
  * Added simulato walkthrough

* Tom Dale
  * Updated tests to print out the results as they are run
  * Tests now always use the test runner even if 1 test
  * Option added to automatically rerun failed tests in both config and cli

## 0.4.0

* Tom Dale
  * Changed the selector methods inside elements to use
    * getElementById
    * querySelector
    * querySelectorAll
    * getElementsByTagName
    * getElementsByClassName
  * Created a new cli/option command to stagger start time of tests using the test runner

* Scott Gunther
  * Changed the precondition assertions to be run against the pageState or dataStore
  * Fix bug where parameters are not passed in to preconditions during planning

## 0.3.5

* Brian Fitzpatrick
  * Fixed a bug where modifications to the expected state by deletion were not retained on children
* Tom Dale
  * Unit tests rest of lib/util lib/cli/orchestration and lib/cli/cli-event-dispatch

## 0.3.4

* Brian Fitzpatrick
  * Included PR template
  * Made changes to ingestion of saucelabs config to allow for percision when modifying default values
  * Modified generated test names to be more clear

* Tom Dale
  * Added bug report template
  * Parent exit code set to 1 when child has an error

## 0.3.3

* Scott Gunther
  * Add badges to readme
  * Add 'has' method to data store
* Tom Dale
  * Sauce connect tunnel is now created before user specified before scripts are run
  * Switched over all MBTT errors to SimulatoErrors for clairty

## 0.3.2

* Scott Gunther
  * Added run time varibles
  * Created run time varible documentation

* Tom Dale
  * Created github.io page
  * Converted old documentation to github.io
  * Added a contributing document

## 0.3.1

* Tom Dale
  * Fixed bug where action parameters were not being executed and passed properly during execution

## 0.3.0

* Brian Fitzpatrick
  * Updated CLI configuration to be exportable to file format, as well as saucelab configuration
* Scott Gunther
  * Data store is broken out of the expected state
  * Data store is now passed in to actions, children, and events
  * Renamed data store methods
  * Update travis to report coverage to codecov
* Tom Dale
  * Refactored create & createAndAddComponent to only take an object as param to follow pattern of children
  * This context is now passed into elements, model, actions (params, preconditions, perform, effects), children, and events to access instanceName and options
  * Changed componentName to type, instance name to name, and the name specified inside components to type for clarity when creating new components
  * Created RELEASE.md document to detail the release process for simulato

## 0.2.1

* Tom Dale - Fixed a typo in acceptance tests where the action preconditions were checking for the wrong elements

## 0.2.0

* Scott Gunther - Prepare code for open sourcing
* Tom Dale - Fixed a bug where dataStore was not being cloned inside expected state
* Scott Gunther - bumped simulato test site version, updated appveyor script for CI builds to run the test site in background
* Tom Dale - Added component names in error messages when validating elements
* Brian Fitzpatrick - Updated article text for more generic use

## 0.1.63

* Scott Gunther - Improve search time for single action. Update Jenkins for vault path change

## 0.1.62

* Tom Dale - Page state hanlder now correctly handles an empty expected state, program continues execution

## 0.1.61

* Tom Dale - Converted exepected state errors to throw MbttErrors

## 0.1.60

* Tom Dale - Added validation on events name when they are passed in as Array

## 0.1.59

* Tom Dale - Updated the execution engine to throw errors, and to filter through the uncaught exception handler

## 0.1.58

* Tom Dale - Added validate actions to expected state

## 0.1.57

* Tom Dale - Added acceptance tests for stashing and popping state

## 0.1.56

* Scott Gunther - Update documentation for events, children, and minor grammar fixes

## 0.1.55

* Tom Dale - Added acceptance tests to the tool

## 0.1.54

* Scott Gunther
  * Add event emitter to expected state to allow inter-component communication
  * Add children to expected state for child components
  * Updated to some ES6 standards

## 0.1.53

* Tom Dale - Created a heuristic for the forward space state search to speed up the generation of tests

## 0.1.52

* Alex Lindeman - fix null versions in jenkinsfile and fix to work on quality-engineering-jenkins

## 0.1.51

* Scott Gunther - Minor bug fixes and added disabled property to list of data retrieved from browser

## 0.1.50

* Scott Gunther - Start README and modify some variable names to match README

## 0.1.49

* Brian Fitzpatrick - Added error handling around action effects and perform in the executor

## 0.1.48

* Brian Fitzpatrick - Added error handling around action effects in the planner. Corrected Error handling in validators

## 0.1.47

* Scott Gunther - Surface precondition errors when planning

## 0.1.46

* Tom Dale - Added the ability to dynamically add dynamic areas on component creation

## 0.1.45

* Scott Gunther - Throw error when planning cannot find goal actions. Update dockerfile for latest changes

## 0.1.44

* Brian Fitzpatrick - Unit testing around expected state

## 0.1.43

* Tom Dale - Added errors for loading in components and test cases

## 0.1.42

* Scott Gunther - Unit and testing executor

## 0.1.41

* Tom Dale - Added non unique component error

## 0.1.40

* Scott Gunther - Add entry component error

## 0.1.39

* Tom Dale - Added missing unit tests for lib/errors. Added errors for models during the exector

## 0.1.38

* Tom Dale - Added precondition errors during execution

## 0.1.37

* Tom Dale - Added a state compare funciton to print difference between expected state and page state. This is used in the assertion handler
to print the difference in the states before throwing an error the states are different

## 0.1.36

* Scott Gunther - Unit and testing and bug fixes for executor

## 0.1.35

* Scott Gunther - Refactor execution engine and add unit tests to executor

## 0.1.34

* Tom Dale - Added uuid to sauce tunnel identifer to avoid sauce connect conflicts with jenkin builds

## 0.1.33

* Tom Dale - Simplified executor/assertion handler. Created errors for elements on creation of instanced models

## 0.1.32

* Alex Lindeman - fix upload pipeline

## 0.1.31

* Scott Gunther - Update package.json version to avert publish conflict

## 0.1.30

* Brian Fitzpatrick - initial commit of change log for new CI setup
