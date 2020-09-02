'use strict';

module.exports = {
  extends: 'google',
  parserOptions: {
    ecmaVersion: 10,
  },
  rules: {
    'max-len': ['error', 120],
    'require-jsdoc': 'off',
  },
};
