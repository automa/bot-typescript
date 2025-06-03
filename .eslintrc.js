module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
    'plugin:mocha/recommended',
  ],
  rules: {
    quotes: ['warn', 'single', { avoidEscape: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/no-empty-named-blocks': 'error',
    'import/no-absolute-path': 'error',
    'import/no-relative-packages': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-exclusive-tests': 'error',
  },
  env: {
    node: true,
    mocha: true,
  },
  ignorePatterns: ['!.prettierrc.js', 'build'],
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
};
