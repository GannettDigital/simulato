'use strict';

module.exports = {
  type: 'CreateStoryModal',
  elements() {
    return [
            {
                name: 'modalTitle',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalTitle'
                }
            },
            {
                name: 'titleBox',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalTitleText'
                },
            },
            {
                name: 'storyBody',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalStoryBodyText'
                }
            },
            {
                name: 'classificationSelect',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalSelectClassification'
                },
            },
            {
                name: 'submitButton',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalSubmitButton'
                }
            },
            {
                name: 'closeButton',
                selector: {
                    type: 'getElementById',
                    value: 'createStoryModalCloseButton'
                }
            }
    ];
    
  },
  model() {
    return {
        displayed: 'modalTitle.isDisplayed',
        titleBox: {
            displayed: 'titleBox.isDisplayed',
        },
        storyBody: {
            displayed: 'storyBody.isDisplayed',
        },
        classificationSelect: {
            displayed: 'classificationSelect.isDisplayed',
        },
        submitButton: {
            displayed: 'submitButton.isDisplayed',
        },
        closeButton: {
            displayed: 'closeButton.isDisplayed'
        },
    };
  },
  actions() {
    return {
        CLOSE_STORY_MODAL:
        {
            preconditions(){
              return [
                ['isTrue', `pageState.${this.name}.closeButton.displayed`]
              ];
            },
            perform(callback){
              driver.findElement(By.id('createStoryModalCloseButton'))
              .click()
              .then(callback,callback);
            },
            effects(expectedState){
              expectedState.pop();
            }
        }
    };
  },
}