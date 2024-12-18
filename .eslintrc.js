/* eslint-disable no-undef */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  env: {
    node: true,
    'jest/globals': true,
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-unused-vars': [
      'warning',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
    ],
    'import/no-named-as-default-member': 0,
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
      alias: {
        map: [
          ['@db', './src/db'],
          ['@data-access', './src/data-access'],
          ['@graphql', './src/graphql'],
          ['@generated', './src/generated'],
          ['@services', './src/services'],
          ['@sockets', './src/sockets'],
          ['@models', './src/models'],
          ['@permissions', './src/permissions'],
          ['@tools', './src/tools'],
          ['@controllers', './src/controllers'],
          ['@routes', './src/routes'],
          ['@scripts', './src/scripts'],
          ['@utils', './src/utils'],
          ['@test', './src/jest'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
    },
  },
};
