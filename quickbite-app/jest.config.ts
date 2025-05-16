import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm', // Use ESM preset
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat .ts and .tsx as ESM
  testEnvironment: 'jest-environment-jsdom',
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Removed setupFilesAfterEnv
  // Rely on the preset for the transform configuration, but adjust transformIgnorePatterns.
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library)/)', // Transform @testing-library packages
    '\\.pnp\\.[^\\/]+$',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json',
        compilerOptions: {
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Handle CSS imports (if you import CSS in your components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias for src directory
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
};

export default config;