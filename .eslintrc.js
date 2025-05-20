module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'build', 'node_modules', '.next'],
  rules: {
    // Global rules for all packages
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Disable requirement for explicit return types
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  overrides: [
    // Extension-specific overrides
    {
      files: ['./extension/**/*.ts', './extension/**/*.tsx'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    // API-specific overrides
    {
      files: ['./api-cf/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
      },
    },
    // Web-specific overrides
    {
      files: ['./web/**/*.ts', './web/**/*.tsx'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
  ],
};
