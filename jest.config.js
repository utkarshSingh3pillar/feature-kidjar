module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/test/.jest/setEnvVars.js"],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  testMatch: ['<rootDir>/test/**/*.test.(ts)']
};