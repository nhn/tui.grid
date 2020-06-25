module.exports = {
  plugins: ['vue', 'prettier'],
  extends: ['tui/es6', 'plugin:vue/base', 'plugin:prettier/recommended'],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 7,
    sourceType: 'module',
  },
};
