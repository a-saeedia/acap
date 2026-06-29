/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@next/next/recommended',
    'plugin:@next/next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    '@next/eslint-plugin-next',
    'prettier',
  ],
  rules: {
    // Customize your rules here
    'react/react-in-jsx-scope': 'off', // Next.js 13+ auto-imports React
    'react/jsx-uses-react': 'off',
    '@next/next/no-img-element': 'off', // Allow <img> elements
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
