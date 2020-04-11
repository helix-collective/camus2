// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    '<rootDir>/setup.ts'
  ],
};

