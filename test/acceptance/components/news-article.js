'use strict';

module.exports = {
  type: 'NewsArticle',
  elements() {
    return [
      {
        name: 'newsArticle',
        selector: {
          type: 'getElementById',
          value: this.options.newsArticleId,
        },
      },
      {
        name: 'newsArticleImage',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}Image`,
        },
      },
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
        parameters: [
          {
            name: 'fakeParameter',
            generate() {
              return 'myFakeParameter';
            },
          },
        ],
        preconditions(fakeParam, dataStore) {
          dataStore.store(`${this.name}HeadingText`, this.getFromPage(`${this.name}.newsArticleHeading.text`));
          dataStore.store(`${this.name}Text`, this.getFromPage(`${this.name}.newsArticleText.text`));

          return [
            ['isTrue', `pageState.${this.name}.displayed`],
            ['property', `dataStore`, `${this.name}HeadingText`],
            ['property', `dataStore`, `${this.name}Text`],
          ];
        },
        perform(fakeParam, callback) {
          driver.findElement(By.id(this.options.newsArticleId))
              .click()
              .then(callback, callback);
        },
        effects(fakeParam, expectedState, dataStore) {
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
                disabled: false,
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
