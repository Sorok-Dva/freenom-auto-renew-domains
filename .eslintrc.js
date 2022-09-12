module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  overrides: [
    /* Global overrides */
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
      },
    },
  ],
  rules: {
    /**
     * Naming Convention
     */
    '@typescript-eslint/naming-convention': ['warn',
      /**
       * Match no-unused-vars config on explicit unused vars with a leading `_`
       */
      {
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
        modifiers: ['unused'],
        selector: ['variable', 'parameter'],
        trailingUnderscore: 'forbid',
      },

      /**
       * Allow `snake_case` for db payload & db types
       */
      {
        format: ['strictCamelCase', 'snake_case'],
        leadingUnderscore: 'forbid',
        selector: ['objectLiteralProperty', 'typeProperty'],
        trailingUnderscore: 'forbid',
      },

      /**
       * Get loose on destructuring since we get payload of a lot of
       * different format.
       */
      {
        format: [
          'strictCamelCase',
          'snake_case',
          'StrictPascalCase',
          'UPPER_CASE',
        ],
        modifiers: ['destructured'],
        selector: 'variable',
      },
    ],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 5 }],

    /**
     * JSDoc
     * Disabling too constraining rules atm
     * will figure out the right tuning later
     * Most of the handler function does not need params/returns
     */
    // TODO: replace with tsdoc or something else
    'jsdoc/require-param': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-jsdoc': 'off',
    // 'jsdoc/require-jsdoc': [
    //   'warn',
    //   {
    //     contexts: [
    //       'TSDeclareFunction:not(TSDeclareFunction + TSDeclareFunction)',
    //       'FunctionDeclaration:not(TSDeclareFunction + FunctionDeclaration)',
    //     ],
    //     require: {
    //       FunctionDeclaration: false,
    //     },
    //   },
    // ],
  },
}
