'use strict';

module.exports = {
    isSuperset(set, subset) {
        for (let item of subset) {
            if (!set.has(item)) {
                return false;
            }
        }
        return true;
    },
    isEqual(setOne, setTwo) {
        if (setOne.size !== setTwo.size) {
            return false;
        }

        for (let item of setOne) {
            if (!setTwo.has(item)) {
                return false;
            }
        }

        return true;
    },
};
