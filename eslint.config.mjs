import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['**/dist', '**/node_modules', '.git/', '**/.next/'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...fixupConfigRules(compat.extends('plugin:@next/next/core-web-vitals')),
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: pluginReactHooks.configs.recommended.rules,
  },
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'warn',
      // 强制每个属性单独一行（无论属性数量）
      'react/jsx-max-props-per-line': ['warn', { maximum: 1 }],
      // 第一个属性必须换行
      'react/jsx-first-prop-new-line': ['warn', 'multiline'],
      // 闭合标签与起始标签对齐
      'react/jsx-closing-bracket-location': ['warn', 'tag-aligned'],
      // 自动换行后的缩进（例如 2 空格）
      'react/jsx-indent-props': ['warn', 2],
      'no-console': [
        'warn',
        {
          allow: ['info', 'error'],
        },
      ],
      'react/prop-types': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
];
