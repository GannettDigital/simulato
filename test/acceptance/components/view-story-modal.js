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
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}ModalTitle`,
        },
      },
      {
        name: 'modalBodyText',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}ModalBodyText`,
        },
      },
      {
        name: 'closeButton',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${this.options.newsArticleId}ModalCloseButton`,
        },
      },
      {
        name: 'xCloseButton',
        selector: {
          type: 'querySelector',
          value: `#${this.options.newsArticleId}ViewModal > div > div > div.modal-header > button`,
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
      xCloseButton: {
        displayed: 'xCloseButton.isDisplayed',
      },
    };
  },
  actions() {
    return {
      CLICK_CLOSE_BUTTON: {
        preconditions(dataStore) {
          return [
            ['isTrue', `${this.name}.closeButton.displayed`],
            ['isFalse', `${this.name}.closeButton.disabled`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(`${this.options.newsArticleId}ModalCloseButton`))
          .click()
          .then(callback, callback);
        },
        effects(expectedState, dataStore) {
          expectedState.pop();
        },
      },
      CLICK_X_CLOSE_BUTTON: {
        preconditions(dataStore) {
          return [
            ['isTrue', `${this.name}.xCloseButton.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.css(`#${this.options.newsArticleId}ViewModal > div > div > div.modal-header > button`))
          .click()
          .then(callback, callback);
        },
        effects(expectedState, dataStore) {
          expectedState.pop();
        },
      },
    };
  },
};
