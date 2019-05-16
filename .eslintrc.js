module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'react', '@typescript-eslint'],
  extends: [
    'tui/es6',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    parser: 'typescript-eslint-parser'
  },
  rules: {
    'prefer-destructuring': [
      'error',
      {
        object: true,
        array: false
      }
    ],
    'newline-before-return': 0,
    'padding-line-between-statements': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    'react/no-unknown-property': 0,
    'accessor-pairs': 0,
    'require-jsdoc': 0,
    'no-new': 0
  },
  settings: {
    react: {
      pragma: 'h',
      version: '16.3'
    }
  }
};
