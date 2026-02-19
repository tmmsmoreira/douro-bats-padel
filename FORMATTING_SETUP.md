# Code Formatting & Linting Setup

This project uses **Prettier** for code formatting and **ESLint** for code quality checks.

## 🚀 Quick Start

### 1. Install VS Code Extensions

The project recommends the following VS Code extensions (you'll be prompted to install them):

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prisma** (`prisma.prisma`)

### 2. Format on Save is Enabled

The workspace is configured to automatically:

- **Format files on save** using Prettier
- **Fix ESLint issues on save** when possible

## 📝 Manual Commands

### Format All Files

```bash
pnpm format
```

### Lint All Packages

```bash
pnpm lint
```

### Lint Specific Package

```bash
# Web app
cd apps/web && pnpm lint

# API
cd apps/api && pnpm lint

# Types package
cd packages/types && pnpm lint
```

## 🔧 Configuration Files

### Prettier

- **Config**: `.prettierrc`
- **Ignore**: `.prettierignore`
- **Settings**:
  - Single quotes
  - Semicolons enabled
  - 2-space indentation
  - 100 character line width
  - ES5 trailing commas

### ESLint

- **Shared config**: `packages/config/eslint-preset.js`
- **Package configs**:
  - `apps/web/.eslintrc.json`
  - `apps/api/.eslintrc.json`
  - `packages/types/.eslintrc.json`

### EditorConfig

- **Config**: `.editorconfig`
- Ensures consistent settings across different editors

## 🪝 Git Hooks (Pre-commit)

The project uses **Husky** and **lint-staged** to automatically format and lint staged files before commit.

### What happens on commit:

1. **Staged `.ts`, `.tsx`, `.js`, `.jsx` files**:
   - ESLint auto-fix
   - Prettier formatting

2. **Staged `.json`, `.md`, `.yml`, `.yaml` files**:
   - Prettier formatting

### Configuration

- **Husky**: `.husky/pre-commit`
- **Lint-staged**: `.lintstagedrc.js`

## 🎯 VS Code Settings

The workspace settings (`.vscode/settings.json`) include:

- ✅ Format on save enabled
- ✅ ESLint auto-fix on save
- ✅ Prettier as default formatter
- ✅ TypeScript workspace version
- ✅ Tailwind CSS IntelliSense configuration

## 🐛 Troubleshooting

### Format on save not working?

1. **Check Prettier extension is installed**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "Extensions: Show Installed Extensions"
   - Verify "Prettier - Code formatter" is installed

2. **Check default formatter**:
   - Open a file
   - Right-click → "Format Document With..."
   - Select "Configure Default Formatter..."
   - Choose "Prettier - Code formatter"

3. **Reload VS Code**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "Developer: Reload Window"

### ESLint not working?

1. **Check ESLint extension is installed**
2. **Check ESLint output**:
   - Open Output panel (`Cmd+Shift+U`)
   - Select "ESLint" from dropdown
3. **Restart ESLint server**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "ESLint: Restart ESLint Server"

### Pre-commit hook not running?

1. **Ensure Husky is initialized**:

   ```bash
   pnpm exec husky init
   ```

2. **Check hook permissions**:

   ```bash
   chmod +x .husky/pre-commit
   ```

3. **Test lint-staged manually**:
   ```bash
   pnpm exec lint-staged
   ```

## 📚 Additional Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
