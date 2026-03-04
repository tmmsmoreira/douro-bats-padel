module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-implicit-any-catch': 'off', // Deprecated in favor of noImplicitAny in tsconfig
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
};
