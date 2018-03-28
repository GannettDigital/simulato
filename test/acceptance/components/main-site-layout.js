'use strict';

const articleData = require('../article-data.json');

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
            text: articleData[0].heading,
          },
          newsArticleText: {
            displayed: true,
            text: articleData[0].text,
          },
        },
        options: {
          newsArticleId: 'article1',
          newsArticleHeading: articleData[0].heading,
          newsArticleText: articleData[0].text,
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
            text: articleData[1].heading,
          },
          newsArticleText: {
            displayed: true,
            text: articleData[1].text,
          },
        },
        options: {
          newsArticleId: 'article2',
          newsArticleHeading: articleData[1].heading,
          newsArticleText: articleData[1].text,
        },
      },
    ];
  },
};
