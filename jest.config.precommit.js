const moduleMap = require('./jest.paths');

module.exports = {
  maxWorkers: '50%',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: moduleMap,
  modulePathIgnorePatterns: ['dist', 'integration', '__tests__'],
  rootDir: './',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/src/jest/setEnvVars.js'],

  verbose: false,
};
