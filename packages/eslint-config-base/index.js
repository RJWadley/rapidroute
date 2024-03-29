module.exports = {
  extends: [
    "airbnb",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
  ],
  rules: {
    /**
     *  Mandatory Rules
     */

    // prettier will conflict with airbnb's rules
    "prettier/prettier": "off",

    // import order
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal"],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    // max lines per file of 200
    "max-lines": [
      "warn",
      {
        max: 250,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // ban type assertion with the `as` keyword
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        assertionStyle: "never",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/ban-types": "error",

    // no unused variables should allow _prefixed variables
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // allow console.error within catch blocks
    "no-console": [
      "error",
      {
        allow: ["error"],
      },
    ],

    // consistent return
    "consistent-return": "off",
  },
}
