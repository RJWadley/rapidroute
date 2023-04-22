module.exports = {
  extends: [
    /**
     * The base for this config is alloy
     */
    "alloy",
    "alloy/react",
    "alloy/typescript",
    /**
     * Bring in @typescript-eslint rules and react rules for TS checking
     */
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    /**
     * and some utility plugins with extra rules
     */
    "adjunct",
    "plugin:ssr-friendly/recommended", // no window access
    "plugin:listeners/strict", // strict event listeners
    "plugin:jsx-a11y/recommended", // a11y for react elements
    "plugin:styled-components-a11y/recommended", // a11y for styled components
    "plugin:prettier/recommended", // disable any pure style rules
    "plugin:react-perf/recommended", // performance mistakes
  ],
  plugins: [
    "@typescript-eslint",
    "function-component-export",
    "listeners",
    "react",
    "sort-styled-components",
    "ssr-friendly",
    "styled-components-a11y",
    "prettier",
    "react-hooks",
    "jsx-a11y",
    "react-perf",
    "validate-jsx-nesting",
  ],
  env: {
    browser: true,
  },
  rules: {
    /**
     *  Mandatory Rules
     */

    // sort styled components based on their usage order
    "sort-styled-components/sort-styled-components": "warn",

    // we define styled components at the bottom, which is better for readability but incompatible with this rule
    "@typescript-eslint/no-use-before-define": "off",

    // any custom hooks that take dependencies need to be specified here
    "react-hooks/exhaustive-deps": [
      "error",
      {
        additionalHooks: "useAnimation",
      },
    ],

    // encourage shorter files
    "max-lines": [
      "warn",
      {
        max: 400,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // ban bad types
    "@typescript-eslint/no-explicit-any": "error",

    // consistent export style
    "function-component-export/ban-FC": "error",
    "function-component-export/combine-default-export": "error",

    // allow console.error and console.warn
    "no-console": ["error", { allow: ["error", "warn"] }],

    // disable rules that typescript handles
    "react/jsx-props-no-spreading": "off",
    "react/no-unknown-property": "off",
    "no-undef": "off",

    // validate nesting
    "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

    /**
     *  Optional or Temporary Rules
     */

    // This rule crashes!
    "@typescript-eslint/no-invalid-this": "off",

    // we can remove this once TS 5.1 drops
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

    // the following rules seem annoying, so I've loosened them up (so they can stay on)
    // the goal should probably be to decrease these over time
    complexity: ["warn", 40],
    "sonarjs/cognitive-complexity": ["warn", 40],
    "max-nested-callbacks": ["warn", 5],
    "max-params": ["warn", 6],
    "consistent-return": "off",
    "no-nested-ternary": "warn",
  },
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  settings: {
    "import/resolver": {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
    react: {
      version: "detect",
    },
  },
}
