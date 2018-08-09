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
          newsTabId: 'main-tab-content-tab-1',
          newsTabSectionId: 'tab-section-1',
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
          newsTabId: 'main-tab-content-tab-2',
          newsTabSectionId: 'tab-section-2',
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
          newsTabId: 'main-tab-content-tab-3',
          newsTabSectionId: 'tab-section-3',
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
          newsTabId: 'main-tab-content-tab-4',
          newsTabSectionId: 'tab-section-4',
        },
      },
    ];
  },
};
