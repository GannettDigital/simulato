'use strict';

module.exports = {
  type: 'ViewStoryModal',
  elements() {
    return [
      {
        name: 'modalContent',
        selector: {
          type: 'querySelector',
          value: `#${this.options.newsArticleId}ViewModal > div > div`,
        },
      },
      {
        name: 'modalTitle',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}ModalTitle`,
        },
      },
      {
        name: 'modalBodyText',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}ModalBodyText`,
        },
      },
      {
        name: 'closeButton',
        selector: {
          type: 'getElementById',
          value: `${this.options.newsArticleId}ModalCloseButton`,
        },
      },
    ];
  },
  model() {
    return {
      displayed: 'modalContent.isDisplayed',
      modalTitle: {
        displayed: 'modalTitle.isDisplayed',
        text: 'modalTitle.innerText',
      },
      modalBodyText: {
        displayed: 'modalBodyText.isDisplayed',
        text: 'modalBodyText.innerText',
      },
      closeButton: {
        displayed: 'closeButton.isDisplayed',
        disabled: 'closeButton.disabled',
      },
    };
  },
  actions() {
    return {
      CLICK_CLOSE_BUTTON: {
        preconditions() {
          return [
            ['isTrue', `pageState.${this.name}.closeButton.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(`${this.options.newsArticleId}ModalCloseButton`))
            .click()
            .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.pop();
        },
      },
    };
  },
};
