'use strict';

module.exports = {
  type: 'NavigateToTestSite',
  entryComponent: {
    name: 'navigateToTestSite',
    state: {},
  },
  elements() {
    return [];
  },
  model() {
    return {};
  },
  actions() {
    return {
      NAVIGATE_TO_TEST_SITE: {
        perform(callback) {
          driver.get(`http://localhost:3000`)
            .then(callback, callback);
        },
        effects(expectedState, dataStore) {
          expectedState.clear();
          expectedState.createAndAddComponent({
            type: 'MainSiteLayout',
            name: 'mainSiteLayout',
            state: {
              displayed: true,
            },
          });
        },
      },
    };
  },
};
