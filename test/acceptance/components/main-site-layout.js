'use strict';

module.exports = {
  type: 'MainSiteLayout',
  elements() {
    return [
      {
        name: 'headerRow',
        selector: {
          type: 'attribute',
          key: 'id',
          value: 'siteHeader',
        },
      },
    ];
  },
  model() {
    return {
      displayed: 'headerRow.isDisplayed',
    };
  },
  actions() {
    return {};
  },
  children(expectedState, dataStore) {
    return [
      {
        type: 'NewsArticle',
        name: 'newsArticle1',
        state: {
          displayed: true,
          newsArticleImage: {
            displayed: true,
          },
          newsArticleHeading: {
            displayed: true,
            text: this.getFromPage('newsArticle1.newsArticleHeading.text'),
          },
          newsArticleText: {
            displayed: true,
            text: this.getFromPage('newsArticle1.newsArticleText.text'),
          },
        },
        options: {
          newsArticleId: 'article1',
        },
      },
      {
        type: 'NewsArticle',
        name: 'newsArticle2',
        state: {
          displayed: true,
          newsArticleImage: {
            displayed: true,
          },
          newsArticleHeading: {
            displayed: true,
            text: this.getFromPage('newsArticle2.newsArticleHeading.text'),
          },
          newsArticleText: {
            displayed: true,
            text: this.getFromPage('newsArticle2.newsArticleText.text'),
          },
        },
        options: {
          newsArticleId: 'article2',
        },
      },
    ];
  },
  events(expectedState, dataStore) {
    // dataStore.store('newsArticle1HeadingText', this.getFromPage('newsArticle1.newsArticleHeading.text'));
    // dataStore.store('newsArticle1Text', this.getFromPage('newsArticle1.newsArticleText.text'));

    // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
    // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
    // let myThis = this;s
    return [
      {
        name: 'something',
        listener() {
          console.log('hello');
          // dataStore.store('newsArticle1HeadingText', myThis.getFromPage('newsArticle1.newsArticleHeading.text'));
          // dataStore.store('newsArticle1Text', myThis.getFromPage('newsArticle1.newsArticleText.text'));

          // dataStore.store('newsArticle2HeadingText', myThis.getFromPage('newsArticle2.newsArticleHeading.text'));
          // dataStore.store('newsArticle2Text', myThis.getFromPage('newsArticle2.newsArticleText.text'));
        },
      },
    ];
  },
};
