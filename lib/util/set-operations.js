'use strict';

module.exports = {
  isSuperset(set, subset) {
    for (let element of subset) {
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

    for (let element of setA) {
      if (!setB.has(element)) {
        return false;
      }
    }

    return true;
  },
  difference(setA, setB) {
    let difference = new Set(setA);
    for (let element of setB) {
      difference.delete(element);
    }
    return difference;
  },
};
