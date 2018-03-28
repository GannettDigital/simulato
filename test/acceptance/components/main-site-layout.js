'use strict';

// const articleData = require('../article-data.json');

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
            // text: articleData[0].heading,
            text: this.getFromPage('newsArticle1.newsArticleHeading.text'),
          },
          newsArticleText: {
            displayed: true,
            // text: articleData[0].text,
            text: this.getFromPage('newsArticle1.newsArticleText.text'),
          },
        },
        options: {
          newsArticleId: 'article1',
          // newsArticleHeading: articleData[0].heading,
          // newsArticleText: articleData[0].text,
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
          // newsArticleHeading: articleData[1].heading,
          // newsArticleText: articleData[1].text,
        },
      },
    ];
  },
  events(instanceName, options, expectedState, dataStore) {
    // dataStore.store('newsArticle1HeadingText', this.getFromPage('newsArticle1.newsArticleHeading.text'));
    // dataStore.store('newsArticle1Text', this.getFromPage('newsArticle1.newsArticleText.text'));

    // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
    // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
    return [
      {
        name: 'something',
        listener() {
          console.log('hello');
        },
      },
    ];
  },
};
