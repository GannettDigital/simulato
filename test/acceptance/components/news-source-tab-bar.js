'use strict';

module.exports = {
  type: 'NewsSourceTabBar',
  elements() {
    return [];
  },
  model() {
    return {};
  },
  actions() {
    return {
    };
  },
  children() {
    return [
      {
        type: 'NewsSourceTab',
        name: 'homeTab',
        state: {
          displayed: true,
          active: false,
        },
        options: {
          newsTabId: 'mainTabContentTab1',
          newsTabSectionId: 'tabSection1',
        },
      },
      {
        type: 'NewsSourceTab',
        name: 'topStoriesTab',
        state: {
          displayed: true,
          active: false,
        },
        options: {
          newsTabId: 'mainTabContentTab2',
          newsTabSectionId: 'tabSection2',
        },
      },
      {
        type: 'NewsSourceTab',
        name: 'breakingStoriesTab',
        state: {
          displayed: true,
          active: false,
        },
        options: {
          newsTabId: 'mainTabContentTab3',
          newsTabSectionId: 'tabSection3',
        },
      },
      {
        type: 'NewsSourceTab',
        name: 'simulatoStoriesTab',
        state: {
          displayed: true,
          active: false,
        },
        options: {
          newsTabId: 'mainTabContentTab4',
          newsTabSectionId: 'tabSection4',
        },
      },
    ];
  },
};
