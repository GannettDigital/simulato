'use strict';

module.exports = {
  type: 'NewsSourceTab',
  elements() {
    return [
      {
        name: 'newsTab',
        selector: {
          type: 'getElementById',
          value: this.options.newsTabId,
        },
      },
      {
        name: 'newsTabSection',
        selector: {
          type: 'getElementById',
          value: this.options.newsTabSectionId,
        },
      },
    ];
  },
  model() {
    return {
      displayed: 'newsTab.isDisplayed',
      active(elements) {
        return elements.newsTabSection.attributes['aria-selected'] ? true : false;
      },
    };
  },
  actions() {
    return {
      CLICK_NEWS_TAB: {
        preconditions() {
          return [
            ['isTrue', `pageState.${this.name}.displayed`],
          ];
        },
        perform(callback) {
          driver.findElement(By.id(this.options.newsTabId))
          .click()
          .then(callback, callback);
        },
        effects(expectedState) {
          expectedState.createAndAddComponent({
            type: 'NewsArticle',
            name: 'newsArticle1',
            state: {
              displayed: true,
              newsArticleImage: {
                displayed: true,
              },
              newsArticleHeading: {
                displayed: true,
                text: this.getFromPage('newsArticle1.newsArticleHeading.text'),
              },
              newsArticleText: {
                displayed: true,
                text: this.getFromPage('newsArticle1.newsArticleText.text'),
              },
            },
            options: {
              newsArticleId: `${this.options.newsTabSectionId}-article1`,
            },
          });
          expectedState.createAndAddComponent({
              type: 'NewsArticle',
              name: 'newsArticle2',
              state: {
                displayed: true,
                newsArticleImage: {
                  displayed: true,
                },
                newsArticleHeading: {
                  displayed: true,
                  text: this.getFromPage('newsArticle2.newsArticleHeading.text'),
                },
                newsArticleText: {
                  displayed: true,
                  text: this.getFromPage('newsArticle2.newsArticleText.text'),
                },
              },
              options: {
                newsArticleId: `${this.options.newsTabSectionId}-article2`,
              },
          });
        },
      },
    };
  },
};
