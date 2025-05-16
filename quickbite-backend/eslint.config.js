const globals = require('globals');
const js = require('@eslint/js');
const jestPlugin = require('eslint-plugin-jest'); // Import jest plugin if available, or use globals

module.exports = [
  {
    // General config for all JS files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      ...js.configs.recommended.rules, // Start with recommended rules
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  {
    // Config specific to test files
    files: ['__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    plugins: { // Uncommented and using jestPlugin
      jest: jestPlugin,
    },
    rules: { // Uncommented and using jestPlugin rules
      ...jestPlugin.configs.recommended.rules,
    },
    languageOptions: { // Jest globals are usually included by the plugin's recommended config, but doesn't hurt to keep
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    // Ignore specific files or directories
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  }
];