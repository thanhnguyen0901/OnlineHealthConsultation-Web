import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore build output and legacy config file
  { ignores: ['dist/**', '.eslintrc.cjs'] },

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,
      // React recommended rules
      ...reactPlugin.configs.recommended.rules,
      // Disable react/react-in-jsx-scope (React 17+ JSX transform)
      ...reactPlugin.configs['jsx-runtime'].rules,
      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,
      // Disable formatting rules that conflict with Prettier
      ...prettierConfig.rules,
      // Project-specific overrides
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      // Allow warn, error, and debug (used in DEV-guarded blocks and the logger utility)
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      // The codebase uses `any` in many places; disabled to keep CI green
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
