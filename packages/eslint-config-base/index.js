module.exports = {
  extends: ["airbnb", "airbnb-typescript/base", "plugin:prettier/recommended"],
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
        max: 200,
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
  },
}
