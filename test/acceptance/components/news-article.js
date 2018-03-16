'use strict';

module.exports = {
  name: 'NewsArticle',
  elements(instanceName, options) {
    return [
      {
        name: 'newsArticle',
        selector: {
          type: 'attribute',
          key: 'id',
          value: options.newsArticleId,
        },
      },
      {
        name: 'newsArticleImage',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}Image`,
        },
      },
      {
        name: 'newsArticleHeading',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}Heading`,
        },
      },
      {
        name: 'newsArticleText',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}Text`,
        },
      },
    ];
  },
  model() {
    return {
      displayed: 'newsArticle.isDisplayed',
      newsArticleImage: {
        displayed: 'newsArticleImage.isDisplayed',
      },
      newsArticleHeading: {
        displayed: 'newsArticleHeading.isDisplayed',
        text: 'newsArticleHeading.innerText',
      },
      newsArticleText: {
        displayed: 'newsArticleText.isDisplayed',
        text: 'newsArticleText.innerText',
      },
    };
  },
  actions(instanceName, options) {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions() {
          return [
            ['isTrue', `${instanceName}.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(options.newsArticleId))
          .click()
          .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.stash();
          expectedState.createAndAddComponent('ViewStoryModal', `${options.newsArticleId}ViewModal`, {
            displayed: true,
            modalTitle: {
              displayed: true,
              text: options.newsArticleHeading,
            },
            modalBodyText: {
              displayed: true,
              text: options.newsArticleText,
            },
            closeButton: {
              displayed: true,
            },
            xCloseButton: {
              displayed: true,
            },
          }, {
            newsArticleId: options.newsArticleId,
          });
        },
      },
    };
  },
};
