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
};
