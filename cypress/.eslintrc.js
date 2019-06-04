module.exports = {
  env: {
    mocha: true
  },
  globals: {
    cy: 'readonly',
    Cypress: 'readonly',
    expect: 'readonly'
  },
  rules: {
    'newline-before-return': 0,
    'padding-line-between-statements': 0,
    'no-unused-expressions': 0,
    'dot-notation': 0,
    'max-nested-callbacks': { 'max': 5 }
  }
};
