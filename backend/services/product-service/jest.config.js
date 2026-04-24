module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/db/**',
  ],
  verbose: true,
  clearMocks: true,
  resetModules: true,
  restoreMocks: true,
};
