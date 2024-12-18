/* eslint-disable no-undef */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@db': './db',
          db: '../db/src',
          '@data-access': './data-access',
          '@db-tables': '../db/src/tables',
          '@db-fixtures': '../db/src/fixtures',
          '@db-types': '../db/src/types',
          '@generated': './generated',
          '@graphql': './graphql',
          '@models': './models',
          '@services': './services',
          '@sockets': './sockets',
          '@controllers': './controllers',
          '@permissions': './permissions',
          '@tools': './tools',
          '@utils': './utils',
        },
      },
    ],
  ],
};
