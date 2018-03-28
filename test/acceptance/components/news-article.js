'use strict';

module.exports = {
  type: 'NewsArticle',
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
<<<<<<< HEAD
  actions(instanceName, options, dataStore) {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions() {
          console.log('hello');
          dataStore.store(`${instanceName}HeadingText`, this.getFromPage(`${instanceName}.newsArticleHeading.text`));
          dataStore.store(`${instanceName}Text`, this.getFromPage(`${instanceName}.newsArticleText.text`));

          // dataStore.store('newsArticle2HeadingText', this.getFromPage('newsArticle2.newsArticleHeading.text'));
          // dataStore.store('newsArticle2Text', this.getFromPage('newsArticle2.newsArticleText.text'));
=======
  actions() {
    return {
      CLICK_TO_VIEW_STORY: {
        preconditions(dataStore) {
>>>>>>> origin/master
          return [
            ['isTrue', `${this.name}.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(this.options.newsArticleId))
          .click()
          .then(callback, callback);
        },
        effects(expectedState, dataStore) {
          expectedState.stash();
<<<<<<< HEAD
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
=======
          expectedState.createAndAddComponent({
            type: 'ViewStoryModal',
            name: `${this.options.newsArticleId}ViewModal`,
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
>>>>>>> origin/master
            },
          });
        },
      },
    };
  },
};
