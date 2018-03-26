'use strict';

module.exports = {
  name: 'NewsArticle',
  elements() {
    return [
      {
        name: 'newsArticle',
        selector: {
          type: 'attribute',
          key: 'id',
          value: this.options.newsArticleId,
        },
      },
      {
        name: 'newsArticleImage',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}Image`,
        },
      },
      {
        name: 'newsArticleHeading',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}Heading`,
        },
      },
      {
        name: 'newsArticleText',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}Text`,
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
  actions() {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions(dataStore) {
          return [
            ['isTrue', `${this.instanceName}.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(this.options.newsArticleId))
          .click()
          .then(callback, callback);
        },
        effects(expectedState, dataStore) {
          expectedState.stash();
          expectedState.createAndAddComponent({
            componentName: 'ViewStoryModal',
            instanceName: `${this.options.newsArticleId}ViewModal`,
            state: {
              displayed: true,
              modalTitle: {
                displayed: true,
                text: this.options.newsArticleHeading,
              },
              modalBodyText: {
                displayed: true,
                text: this.options.newsArticleText,
              },
              closeButton: {
                displayed: true,
              },
              xCloseButton: {
                displayed: true,
              },
            },
            options: {
              newsArticleId: this.options.newsArticleId,
            },
          });
        },
      },
    };
  },
};
