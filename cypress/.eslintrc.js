module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    mocha: true
  },
  globals: {
    Cypress: 'readonly',
    cy: 'readonly',
    expect: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['prettier'],
  extends: ['tui/es6', 'plugin:prettier/recommended']
};