'use strict';

module.exports = {
  name: 'ViewStoryModal',
  elements(instanceName, options) {
    return [
      {
        name: 'modalContent',
        selector: {
          type: 'querySelector',
          value: `#${options.newsArticleId}ViewModal > div > div`,
        },
      },
      {
        name: 'modalTitle',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}ModalTitle`,
        },
      },
      {
        name: 'modalBodyText',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}ModalBodyText`,
        },
      },
      {
        name: 'closeButton',
        selector: {
          type: 'attribute',
          key: 'id',
          value: `${options.newsArticleId}ModalCloseButton`,
        },
      },
      {
        name: 'xCloseButton',
        selector: {
          type: 'querySelector',
          value: `#${options.newsArticleId}ViewModal > div > div > div.modal-header > button`,
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
      },
      xCloseButton: {
        displayed: 'xCloseButton.isDisplayed',
      },
    };
  },
  actions(instanceName, options) {
    return {
      CLICK_CLOSE_BUTTON: {
        preconditions() {
          return [
            ['isTrue', `${instanceName}.closeButton.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(`${options.newsArticleId}ModalCloseButton`))
          .click()
          .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.pop();
        },
      },
      CLICK_X_CLOSE_BUTTON: {
        preconditions() {
          return [
            ['isTrue', `${instanceName}.xCloseButton.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.css(`#${options.newsArticleId}ViewModal > div > div > div.modal-header > button`))
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
