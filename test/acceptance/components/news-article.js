'use strict';

module.exports = {
  type: 'NewsArticle',
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
  actions(instanceName, options, dataStore) {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions() {
          dataStore.store(`${instanceName}HeadingText`, this.getFromPage(`${instanceName}.newsArticleHeading.text`));
          dataStore.store(`${instanceName}Text`, this.getFromPage(`${instanceName}.newsArticleText.text`));

          // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
          // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
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
          console.log(dataStore.retrieve(`${instanceName}HeadingText`));
          console.log(dataStore.retrieve(`${instanceName}Text`));
          expectedState.createAndAddComponent('ViewStoryModal', `${options.newsArticleId}ViewModal`, {
            displayed: true,
            modalTitle: {
              displayed: true,
              // text: options.newsArticleHeading,
              text: dataStore.retrieve(`${instanceName}HeadingText`),
            },
            modalBodyText: {
              displayed: true,
              // text: options.newsArticleText,
              text: dataStore.retrieve(`${instanceName}Text`),
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
