const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ["dist/", "node_modules/", "vite/", "log.js", "commitlint.config.js", "eslint.config.js", ".husky/"]
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        browser: true,
        es2021: true
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettier
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  },
  prettierConfig
];
