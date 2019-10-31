'use strict';

const crypto = require('crypto');
// const setOperations = require('../util/set-operations.js');

module.exports = function reduceToMinimumSetOfPlans(plans, algorithm, callback) {
  let finalPlans = [];
  let hashes = new Set();

  if (algorithm.toLowerCase() === 'actiontree') {
    plans.forEach(function(plan, index) {
      const hash = crypto.createHash('sha256');
      let planString = JSON.stringify(plan);
      const planHashDigest = hash.update(planString).digest('base64');

      let hasExistingPlan = hashes.has(planHashDigest);

      if (!hasExistingPlan) {
        hashes.add(planHashDigest);
        finalPlans.push(plan);
      }
    });

    callback(null, finalPlans);
  };
};
