'use strict';

module.exports = {
  type: 'MainSiteLayout',
  elements() {
    return [
      {
        name: 'headerRow',
        selector: {
          type: 'getElementById',
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
};
