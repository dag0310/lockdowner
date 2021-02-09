module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'max-len': 'off',
    'no-restricted-syntax': 'off',
  },
  globals: {
    dayjs: false,
    Chart: false,
  },
};
