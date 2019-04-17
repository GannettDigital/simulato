'use strict';

const setOperations = require('../util/set-operations.js');

module.exports = function reduceToMinimumSetOfPlans(plans, algorithm, callback) {
  let finalPlans = [];

  plans.forEach(function(plan, index) {
    let planPath;
    switch (algorithm) {
      case 'actionTree':
        planPath = new Set(plan);
        break;
      default:
        planPath = new Set(plan.path);
    }
    let hasSuperset = false;

    let plansWithCurrentPlanRemoved = plans.filter(function(plan, filterIndex) {
      return index !== filterIndex;
    });

    for (let myPlan of plansWithCurrentPlanRemoved) {
      let myPlanPath;
      switch (algorithm) {
        case 'actionTree':
          myPlanPath = new Set(myPlan);
          break;
        default:
          myPlanPath = new Set(myPlan.path);
      }
      if (setOperations.isSuperset(myPlanPath, planPath)) {
        hasSuperset = true;
        break;
      }
    }

    if (!hasSuperset) {
      finalPlans.push(plan);
    }
  });

  callback(null, finalPlans);
};
