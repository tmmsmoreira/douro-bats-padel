/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/test/**/*.spec.ts'],
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2021',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          strictNullChecks: false,
          noImplicitAny: false,
          skipLibCheck: true,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // Resolve @padel/types to the source so tests don't require a prebuilt dist
    '^@padel/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@padel/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/dto/**',
    '!src/main.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary'],
  clearMocks: true,
};
