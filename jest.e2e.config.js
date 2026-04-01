module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/e2e-docker/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@resolvers/(.*)$': '<rootDir>/src/resolvers/$1',
  },
  globalSetup: '<rootDir>/src/__tests__/e2e-docker/globalSetup.js',
  globalTeardown: '<rootDir>/src/__tests__/e2e-docker/globalTeardown.js',
  testTimeout: 30000,
};
