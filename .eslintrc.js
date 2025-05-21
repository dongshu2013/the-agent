module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'build', 'node_modules', '.next'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
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
    // Disable requirement for explicit return types on all functions
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Allow declarations in case blocks
    'no-case-declarations': 'off',
    // Allow empty blocks in specific cases
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Allow while(true) loops but catch constant conditions elsewhere
    'no-constant-condition': ['error', { checkLoops: false }],
    // Enforce consistent quote style (single quotes)
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  },
  overrides: [
    // Config files overrides
    {
      files: ['*.js', '*.cjs'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
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
