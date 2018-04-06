---
permalink: /bug-report-template/
title: 'Bug Report Template'
toc: false
---

Please use the following template when creating a bug [issue](https://github.com/GannettDigital/simulato/issues) in github.

## Description of What You Observed

Provide a small description of the issue. What unexpected behavior is the bug producing, how is it affecting the normal flow of the code.

## Steps to Reproduce

Provide a detailed list of steps that someone can follow to replicate the bug. Don't assume any part of the steps, start from the very beginning and list every step until the bug is shown.  A good suggestion is to follow your own steps after creating them, and making sure the bug reappears. 

## Expected Behavior

Descripe what the behavior should be when you reach the point where the bug is found.

## Suggestion to Fix (optional)

If you have an idea of how to fix it provide a set of instructions as to how you think it can be fixed.

## Example Report

Description: 

When the effects action fails during execution, and the report is printed out to show the difference between page state and expected state, the printout does not show any thing from expected or page state if the model section of the component does not have a property that we expect during the effects.

Steps to reproduce:

1. Create an entry component to go to a website
2. Have at least one component that is added to expected state for the effects of going to the website
3. Add an property to the state when creating the component that does not exist inside the model of the component you are adding
4. Run the tests, the effects will fail with a bugged print report

Expected Behavior:

When the report is printed out, it should show the value we expected, and the page state should tell us undefined, or something that shows it was not part of the calculated model
