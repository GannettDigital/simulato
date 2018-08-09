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
      {
        name: 'storyButton',
        selector: {
          type: 'getElementById',
          value: 'createStoryButton',
        },
      },
      {
        name: 'tabBar',
        selector: {
          type: 'getElementById',
          value: 'main-tab-content',
        },
      },
    ];
  },
  model() {
    return {
      displayed: 'headerRow.isDisplayed',
      createStoryButton: {
        displayed: 'storyButton.isDisplayed',
      },
      mainTabBar: {
        displayed: 'tabBar.isDisplayed',
      },
    };
  },
  actions() {
    return {
      CLICK_CREATE_STORY_BUTTON:
      {
        preconditions() {
          return [
            ['isTrue', `pageState.${this.name}.createStoryButton.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id('createStoryButton'))
          .click()
          .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.stash();
          expectedState.createAndAddComponent({
            type: 'CreateStoryModal',
            name: 'createStoryModal',
            state: {
              displayed: true,
              titleBox: {
                  displayed: true,
              },
              storyBody: {
                  displayed: true,
              },
              classificationSelect: {
                  displayed: true,
              },
              submitButton: {
                  displayed: true,
              },
              closeButton: {
                  displayed: true,
              },
            },
          });
        },
      },
    };
  },
  children() {
    return [
      {
        type: 'NewsSourceTabBar',
        name: 'newsSourceTabBar',
        state: {

        },
        options: {
          newsArticleId: 'article1',
        },
      },
    ];
  },
};
