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
  actions(instanceName, options, dataStore) {
    return {
      NAVIGATE_TO_TEST_SITE: {
        perform(callback) {
          driver.get(`http://localhost:3000`)
          .then(callback, callback);
        },
        effects(expectedState) {
          // console.log(this.expectedState._pageState);

          expectedState.clear();

          // console.log(this.getFromPage('newsArticle2.newsArticleHeading.text'));
          expectedState.createAndAddComponent('MainSiteLayout', 'mainSiteLayout', {
            displayed: true,
          });

          // dataStore.store('newsArticle1HeadingText', this.getFromPage('newsArticle1.newsArticleHeading.text'));
          // dataStore.store('newsArticle1Text', this.getFromPage('newsArticle1.newsArticleText.text'));

          // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
          // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
        },
      },
    };
  },
};
