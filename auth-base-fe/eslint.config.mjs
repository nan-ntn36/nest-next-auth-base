import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'coverage/**', '**/*.d.ts', 'eslint.config.mjs'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { settings: { next: { rootDir: ['.'] } } },

  {
    languageOptions: {
      sourceType: 'module',
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
      globals: { ...globals.node },
    },
  },
  eslintPluginPrettierRecommended,
  { rules: { 'prettier/prettier': ['error', { endOfLine: 'auto' }] } },
];
