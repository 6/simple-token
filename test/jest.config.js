const tsconfig = require('../tsconfig.json');

module.exports = {
  rootDir: '../',
  transform: {
    '\\.ts$': 'ts-jest',
  },
  clearMocks: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setupJest.ts']
};
