---
permalink: /contributing-guidelines/
title: 'Contributing Guidelines'
toc_label: 'Guidelines'
---

## Github Issues

All Issues are tracked within the github repository's [issue section](https://github.com/GannettDigital/simulato/issues). 

### Creating an Issue
When adding a feature request, bug, or even just questions please check that a prexsisting issue doesn't already exist for the same topic.

Please add a descriptive label from the right side bar, a concise, easily understandable title, and fill out a comment section with the description of your issue.

### Working on an Issue
If there is an issue you want to help solve to contribute back to the project, first check if that issue is currently being worked on. This can be found inside the [projects tab](https://github.com/GannettDigital/simulato/projects) on github. If someone is currently working on an issue reach out to them! Having two heads working on a problem is better than one, don't be afraid to collaborate. If no one is currently working on the issue, inside the issue section you can set it to the project simulato, and add yourself as the assignee.

Once you start working on it, move it to in progress on the project board. This allows others to know who is doing what and the progress being made.

### Tracking an Issue
Issues that are currently in progress can be found in the [projects tab](https://github.com/GannettDigital/simulato/projects).  You can check the assignee field to know who is currently working on it, and reach out to them if any further information is needed.

## Branch Naming Convention
When working on the tool please prepend all branches with the issue number you are working on. If there is no issue related to what you are contributing,please create one following the guidelines above. Example branch name: `issue-33`.

## Linter
All code should be run through the linter already set up with the tool. This is as easy as before you put up a PR running the npm script `lint` found in the package.json.

`$ npm run lint`

## Testing Requirements
This section describes the testing requirements needed for a pull request to be merged into master.

### Unit Testing
All modified/added code must be unit tested, no PRs will be merged into master that lower the coverage report provided by [codecov.io](https://codecov.io/gh/GannettDigital/simulato/).  All tests should reside inside `/test/unit/<pathToFileInLib>`.

### Acceptance Testing
When adding or modifying a feature of the tool, an acceptance test must be added to test that feature. Currently all acceptance tests are models created residing in `/test/acceptance/components`. These components are models that are run against our test site which can be found [here](https://github.com/GannettDigital/simulato-test-site). If the site needs to be modified to add new website features to test the new feature you are adding simulato, all PRs against the test site should follow the guidelines described here.

## Changelog
Before putting up the pull request for your changes, please add what you did to the CHANGELOG.md file. This allows us and others to know who did what. At the top of the changelog under "Pending Version" put your name, and detail the changes made. See previous version descriptions for examples.

## PR Process

Once everything is ready to go based on the guidelines above you are ready to put up your Pull Request! Title the pull request your issue number and short descrption then, follow the template provided in github for creating the PR.

All checks must be passing that are automatically run by the CI process, and the branch must be updated to the most recent version of the branch it is merging into. Once all these checks are passing, it will be reviewed by a core member of the simulato team.  Once approved your code will be merged in, and you can count yourself a contributer to simulato!