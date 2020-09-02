'use strict';

const crypto = require('crypto');

module.exports = function reduceToMinimumSetOfPlans(plans, algorithm, callback) {
  const finalPlans = [];
  const hashes = new Set();

  if (algorithm.toLowerCase() === 'actiontree') {
    plans.forEach(function(plan, index) {
      const hash = crypto.createHash('sha256');
      const planString = JSON.stringify(plan);
      const planHashDigest = hash.update(planString).digest('base64');

      const hasExistingPlan = hashes.has(planHashDigest);

      if (!hasExistingPlan) {
        hashes.add(planHashDigest);
        finalPlans.push(plan);
      }
    });

    callback(null, finalPlans);
  } else {
    callback(null, plans);
  };
};
