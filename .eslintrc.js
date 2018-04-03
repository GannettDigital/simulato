'use strict';

module.exports = {
    extends: 'google',
     parserOptions: {
        ecmaVersion: 6
    },
    rules: {
        'max-len': ['error', 120],
        'require-jsdoc': 'off',
        'prefer-rest-params': 'off'
    } 
};