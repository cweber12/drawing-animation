const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const jsxA11y = require('eslint-plugin-jsx-a11y');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'public/**',
      '*.min.js',
      '*.bundle'
    ]
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require.resolve('@babel/eslint-parser'),
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      'jsx-a11y': jsxA11y
    },
    settings: {
      react: { version: 'detect' }
    },
    extends: [
      'eslint:recommended',
      reactPlugin.configs && reactPlugin.configs.recommended,
      reactHooks.configs && reactHooks.configs.recommended,
      reactNative.configs && reactNative.configs.recommended
    ].filter(Boolean),
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  }
];
