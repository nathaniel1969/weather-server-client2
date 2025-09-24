export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/setupTests.js'],
  transform: {
    // eslint-disable-next-line no-useless-escape
    '^.+\.jsx?: 'babel-jest'
  },
  globals: {
    jest: true,
    test: true,
    expect: true,
    describe: true,
    it: true
  }
};