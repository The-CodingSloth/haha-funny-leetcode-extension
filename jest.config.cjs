/** @type {import('jest').Config} */
const config = {
  verbose: true,
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
};

module.exports = config;
