import { Config } from 'jest';

export const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  rootDir: '../',
  clearMocks: true,
  testEnvironment: 'node',
  collectCoverageFrom: ['./server/*.ts', './server/**/*.ts'],
  coveragePathIgnorePatterns: ['./server/server.ts', './server/app.ts'],
};

export default config;
