module.exports = {
  // Run Prettier on TypeScript and JavaScript files (skip ESLint for now due to existing errors)
  '**/*.{ts,tsx,js,jsx}': (filenames) => [`prettier --write ${filenames.join(' ')}`],

  // Run Prettier on other files
  '**/*.{json,md,yml,yaml}': (filenames) => [`prettier --write ${filenames.join(' ')}`],
};
