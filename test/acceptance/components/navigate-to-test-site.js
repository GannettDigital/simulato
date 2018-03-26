'use strict';

module.exports = {
  name: 'NavigateToTestSite',
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
            componentName: 'MainSiteLayout',
            instanceName: 'mainSiteLayout',
            state: {
              displayed: true,
            },
          });
        },
      },
    };
  },
};
