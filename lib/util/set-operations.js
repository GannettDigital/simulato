'use strict';

module.exports = {
  isSuperset(set, subset) {
    for (const element of subset) {
      if (!set.has(element)) {
        return false;
      }
    }
    return true;
  },
  isEqual(setA, setB) {
    if (setA.size !== setB.size) {
      return false;
    }

    for (const element of setA) {
      if (!setB.has(element)) {
        return false;
      }
    }

    return true;
  },
  difference(setA, setB) {
    const difference = new Set(setA);
    for (const element of setB) {
      difference.delete(element);
    }
    return difference;
  },
};
