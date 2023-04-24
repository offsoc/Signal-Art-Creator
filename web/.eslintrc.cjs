// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'airbnb-typescript-prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],

    // No omitting braces, keep on the same line
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    curly: ['error', 'all'],

    // Always use === and !== except when directly comparing to null
    // (which only will equal null or undefined)
    eqeqeq: ['error', 'always', { null: 'never' }],

    // it helps readability to put public API at top,
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',

    // useful for unused or internal fields
    'no-underscore-dangle': 'off',

    // Temp: We have because TypeScript's `allowUnreachableCode` option is on.
    'no-unreachable': 'error',

    // though we have a logger, we still remap console to log to disk
    'no-console': 'error',

    // consistently place operators at end of line except ternaries
    'operator-linebreak': [
      'error',
      'after',
      { overrides: { '?': 'ignore', ':': 'ignore' } },
    ],

    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],

    'no-continue': 'off',
    'lines-between-class-members': 'off',
    'class-methods-use-this': 'off',

    // Prettier overrides:
    'arrow-parens': 'off',
    'function-paren-newline': 'off',
    'max-len': [
      'error',
      {
        // Prettier generally limits line length to 80 but sometimes goes over.
        // The `max-len` plugin doesn’t let us omit `code` so we set it to a
        // high value as a buffer to let Prettier control the line length:
        code: 999,
        // We still want to limit comments as before:
        comments: 90,
        ignoreUrls: true,
      },
    ],

    'react/jsx-props-no-spreading': 'off',

    // Updated to reflect future airbnb standard
    // Allows for declaring defaultProps inside a class
    'react/static-property-placement': ['error', 'static public field'],

    'react/sort-comp': 'off',

    // We don't have control over the media we're sharing, so can't require
    // captions.
    'jsx-a11y/media-has-caption': 'off',

    // We prefer named exports
    'import/prefer-default-export': 'off',

    // Prefer functional components with default params
    'react/require-default-props': 'off',

    // Empty fragments are used in adapters between backbone and react views.
    'react/jsx-no-useless-fragment': [
      'error',
      {
        allowExpressions: true,
      },
    ],

    // Our code base has tons of arrow functions passed directly to components.
    'react/jsx-no-bind': 'off',

    // Does not support forwardRef
    'react/no-unused-prop-types': 'off',

    // Not useful for us as we have lots of complicated types.
    'react/destructuring-assignment': 'off',

    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],

    'react/display-name': 'error',

    // Allow returning values from promise executors for brevity.
    'no-promise-executor-return': 'off',

    // Redux ducks use this a lot
    'default-param-last': 'off',

    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],

    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSInterfaceDeclaration',
        message:
          'Prefer `type`. Interfaces are mutable and less powerful, so we prefer `type` for simplicity.',
      },
      // Defaults
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],

    // Override brace style to enable typescript-specific syntax
    'brace-style': 'off',
    '@typescript-eslint/brace-style': [
      'error',
      '1tbs',
      { allowSingleLine: false },
    ],

    '@typescript-eslint/array-type': ['error', { default: 'generic' }],

    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'chai',
            importNames: ['expect', 'should', 'Should'],
            message: 'Please use assert',
            allowTypeImports: true,
          },
        ],
      },
    ],

    // Overrides recommended by typescript-eslint
    //   https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.0.0
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-useless-constructor': ['error'],
    'no-shadow': 'off',
    'no-useless-constructor': 'off',

    // useful for unused parameters
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Upgrade from a warning
    '@typescript-eslint/explicit-module-boundary-types': 'error',

    '@typescript-eslint/consistent-type-imports': 'error',

    // Already enforced by TypeScript
    'consistent-return': 'off',

    // We build static artifacts, this doesn't matter.
    'import/no-extraneous-dependencies': 'off',
  },
};
