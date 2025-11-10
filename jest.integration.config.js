module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/dist'],
  testMatch: ['**/__tests__/integration/**/*.e2e.test.js'],
  collectCoverage: false,
  passWithNoTests: true,
};