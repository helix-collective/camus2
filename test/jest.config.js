// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    '<rootDir>/setup.ts'
  ],

  // act as node - otherwise assumes browser which means HTTP requests have to obey CORS etc
  testEnvironment: "node",

  // run in series - camus2 does things like install frontendproxy which are not runnable in parallel
  runner: "jest-serial-runner"
};

