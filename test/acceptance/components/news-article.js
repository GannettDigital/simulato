'use strict';

module.exports = {
  type: 'NewsArticle',
  elements() {
    return [
      {
        name: 'newsArticleHeading',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}Heading`,
        },
      },
      {
        name: 'newsArticleText',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}Text`,
        },
      },
    ];
  },
  model() {
    return {
      newsArticleHeading: {
        text: 'newsArticleHeading.innerText',
      },
      newsArticleText: {
        text: 'newsArticleText.innerText',
      },
    };
  },
  actions() {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions(dataStore) {
          dataStore.store(`${this.name}HeadingText`, this.getFromPage(`${this.name}.newsArticleHeading.text`));
          dataStore.store(`${this.name}Text`, this.getFromPage(`${this.name}.newsArticleText.text`));

          return [
            ['property', `dataStore`, `${this.name}HeadingText`],
            ['property', `dataStore`, `${this.name}Text`],
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
            type: 'ViewStoryModal',
            name: `${this.options.newsArticleId}ViewModal`,
            state: {
              displayed: true,
              modalTitle: {
                displayed: true,
                text: dataStore.retrieve(`${this.name}HeadingText`),
              },
              modalBodyText: {
                displayed: true,
                text: dataStore.retrieve(`${this.name}Text`),
              },
              closeButton: {
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
