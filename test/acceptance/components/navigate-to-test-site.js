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
  actions(instanceName, options) {
    return {
      NAVIGATE_TO_TEST_SITE: {
        perform(callback) {
          driver.get(`http://localhost:3000`)
          .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.clear();
          expectedState.createAndAddComponent('MainSiteLayout', 'mainSiteLayout', {
            displayed: true,
          });
        },
      },
    };
  },
};
