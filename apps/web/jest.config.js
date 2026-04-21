/** @type {import('jest').Config} */
const commonTransform = {
  '^.+\\.(ts|tsx)$': [
    'ts-jest',
    {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        moduleResolution: 'node',
        jsx: 'react-jsx',
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        resolveJsonModule: true,
      },
    },
  ],
};

const commonModuleNameMapper = {
  '^@padel/types$': '<rootDir>/../../packages/types/src/index.ts',
  '^@padel/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
  '^@/(.*)$': '<rootDir>/src/$1',
  // Motion is ESM-only; stub it for tests.
  '^motion/react$': '<rootDir>/test/mocks/motion.ts',
  '^motion$': '<rootDir>/test/mocks/motion.ts',
  // next-intl: test-friendly shim that resolves translations to their keys
  '^next-intl$': '<rootDir>/test/mocks/next-intl.ts',
  // Stub CSS imports
  '\\.(css|scss|sass)$': '<rootDir>/test/mocks/style.ts',
};

module.exports = {
  projects: [
    {
      displayName: 'lib',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/lib/**/*.spec.ts'],
      transform: commonTransform,
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      moduleNameMapper: commonModuleNameMapper,
    },
    {
      displayName: 'components',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/components/**/*.spec.tsx',
        '<rootDir>/src/components/**/*.spec.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
      transform: commonTransform,
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      moduleNameMapper: commonModuleNameMapper,
    },
  ],
  collectCoverageFrom: [
    // Real business logic: utility modules and shared feature components.
    // We deliberately exclude shadcn/Radix wrappers (components/ui), icon SVGs,
    // skeleton components, and config-only modules (animations, constants) —
    // they have no branches to cover and only dilute the overall percentage.
    'src/lib/**/*.ts',
    'src/components/shared/**/*.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/lib/constants.ts',
    '!src/lib/animations.ts',
    '!src/components/shared/skeletons.tsx',
    '!src/components/shared/**/*skeleton*.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary'],
  clearMocks: true,
};
