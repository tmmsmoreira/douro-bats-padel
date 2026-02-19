module.exports = {
  // Run ESLint and Prettier on TypeScript and JavaScript files in web app
  'apps/web/**/*.{ts,tsx,js,jsx}': (filenames) => {
    const relativeFiles = filenames.map((f) => f.replace(/^apps\/web\//, ''));
    return [
      `cd apps/web && ESLINT_USE_FLAT_CONFIG=false pnpm exec eslint --fix ${relativeFiles.join(' ')}`,
      `pnpm exec prettier --write ${filenames.join(' ')}`,
    ];
  },

  // Run ESLint and Prettier on TypeScript and JavaScript files in api app
  'apps/api/**/*.{ts,tsx,js,jsx}': (filenames) => {
    const relativeFiles = filenames.map((f) => f.replace(/^apps\/api\//, ''));
    return [
      `cd apps/api && ESLINT_USE_FLAT_CONFIG=false pnpm exec eslint --fix ${relativeFiles.join(' ')}`,
      `pnpm exec prettier --write ${filenames.join(' ')}`,
    ];
  },

  // Run ESLint and Prettier on TypeScript files in packages
  'packages/**/*.{ts,tsx,js,jsx}': (filenames) => [
    `pnpm exec prettier --write ${filenames.join(' ')}`,
  ],

  // Run Prettier on config files and other files
  '*.{js,ts}': (filenames) => [`pnpm exec prettier --write ${filenames.join(' ')}`],
  '**/*.{json,md,yml,yaml}': (filenames) => [`pnpm exec prettier --write ${filenames.join(' ')}`],
};
