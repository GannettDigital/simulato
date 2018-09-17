'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;

describe('lib/util/set-operations.js', function() {
  describe('isSuperset', function() {
    let setOperations;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/set-operations.js');

      setOperations = require('../../../../lib/util/set-operations.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return true when the passed in set is a superset of the passed in subset', function() {
      let set = new Set(['a', 'b', 'c', 'd']);
      let subset = new Set(['b', 'c']);

      let result = setOperations.isSuperset(set, subset);

      expect(result).to.equal(true);
    });

    it('should return false when the passed in set is not a superset of the passed in subset', function() {
      let set = new Set(['a', 'b', 'c', 'd']);
      let subset = new Set(['w', 'q']);

      let result = setOperations.isSuperset(set, subset);

      expect(result).to.equal(false);
    });

    it('should return true both when set and subset are empty sets', function() {
      let set = new Set();
      let subset = new Set();

      let result = setOperations.isSuperset(set, subset);

      expect(result).to.equal(true);
    });

    it('should return true if subset is an empty set', function() {
      let set = new Set(['a', 'b', 'c', 'd']);
      let subset = new Set();

      let result = setOperations.isSuperset(set, subset);

      expect(result).to.equal(true);
    });
  });

  describe('isEqual', function() {
    let setOperations;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/set-operations.js');

      setOperations = require('../../../../lib/util/set-operations.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if setA and setB are not of equal size', function() {
      it('should return false', function() {
        let setA = new Set([2, 4, 5]);
        let setB = new Set([2, 4]);

        let result = setOperations.isEqual(setA, setB);

        expect(result).to.equal(false);
      });
    });

    describe('if setA and setB are the same size', function() {
      describe('if setA and setB are equal', function() {
        it('should return true if both sets are equal', function() {
          let setA = new Set([2, 4, 5]);
          let setB = new Set([2, 4, 5]);

          let result = setOperations.isEqual(setA, setB);

          expect(result).to.equal(true);
        });
      });

      describe('if setA and setB are not equal', function() {
        it('should return false', function() {
          let setA = new Set([2, 4, 5]);
          let setB = new Set([2, 3, 5]);

          let result = setOperations.isEqual(setA, setB);

          expect(result).to.equal(false);
        });
      });
    });
  });

  describe('difference', function() {
    let setOperations;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/set-operations.js');

      setOperations = require('../../../../lib/util/set-operations.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return an empty set when both sets are empty sets', function() {
      let setA = new Set();
      let setB = new Set();

      let result = setOperations.difference(setA, setB);

      expect(result).to.deep.equal(new Set());
    });

    it('should return the elements in setA that are not in setB', function() {
      let setA = new Set(['a', 'b', 'c', 'd']);
      let setB = new Set(['b', 'd']);

      let result = setOperations.difference(setA, setB);

      expect(result).to.deep.equal(new Set(['a', 'c']));
    });

    it('should return an empty set when there is not difference between setA and setB', function() {
      let setA = new Set(['b', 'd']);
      let setB = new Set(['a', 'b', 'c', 'd']);

      let result = setOperations.difference(setA, setB);

      expect(result).to.deep.equal(new Set());
    });
  });
});
