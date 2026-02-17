module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: ['react', 'react-hooks', 'react-native', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  }
};
