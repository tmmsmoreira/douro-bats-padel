import eslintPreset from '../../packages/config/eslint-preset.mjs';

export default [
  ...eslintPreset,
  {
    ignores: ['dist', 'build', '.next'],
  },
];
