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

        expectedState.eventEmitter.emit('something');

          // dataStore.store('newsArticle1HeadingText', this.getFromPage('newsArticle1.newsArticleHeading.text'));
          // dataStore.store('newsArticle1Text', this.getFromPage('newsArticle1.newsArticleText.text'));

          // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
          // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
        },
      },
    };
  },
};
