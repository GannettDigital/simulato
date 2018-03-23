# model-based-test-tool

## 0.3.0

* Brian Fitzpatrick - Updated CLI configuration to be exportable to file format, as well as saucelab configuration
* Scott Gunther
  * Update travis to report coverage to codecov

## 0.2.1

* Tom Dale - Fixed a typo in acceptance tests where the action preconditions were checking for the wrong elements

## 0.2.0

* Scott Gunther - Prepare code for open sourcing
* Tom Dale - Fixed a bug where dataStore was not being cloned inside expected state
* Scott Gunther - pumped simulato test site version, updated appveyor script for CI builds to run the test site in background
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
