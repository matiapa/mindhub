/* eslint-disable */
export default {
    displayName: 'e2e-test',
    preset: 'ts-jest',
    globalSetup: '<rootDir>/src/global-setup.ts',
    globalTeardown: '<rootDir>/src/global-teardown.ts',
    // setupFiles: ['<rootDir>/src/support/test-setup.ts'],
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    verbose: true,
    // transform: {
    //   '^.+\\.[tj]s$': [
    //     'ts-jest',
    //     {
    //       tsconfig: '<rootDir>/tsconfig.spec.json',
    //     },
    //   ],
    // },
    // moduleFileExtensions: ['ts', 'js', 'html'],
  };
  