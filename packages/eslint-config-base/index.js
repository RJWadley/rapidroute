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
    "plugin:compat/recommended", // browser compatibility
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
    "validate-jsx-nesting",
    "compat",
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

    // define styled components at the bottom, which is better for readability but incompatible with this rule
    "@typescript-eslint/no-use-before-define": "off",

    // any custom hooks that take dependencies need to be specified here
    "react-hooks/exhaustive-deps": [
      "error",
      {
        additionalHooks: "useAnimation|useDeepCompareEffect|useDeepCompareMemo",
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

    // no shadowing
    "@typescript-eslint/no-shadow": "error",

    // consistent export style
    "function-component-export/ban-FC": "error",
    "function-component-export/combine-default-export": "error",

    // allow console.error and console.warn
    "no-console": ["error", { allow: ["error", "warn", "info"] }],

    // disable rules that typescript fully handles
    "react/jsx-props-no-spreading": "off",
    "react/no-unknown-property": "off",
    "no-undef": "off",
    "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
    "unicorn/no-array-callback-reference": "off",

    // validate nesting
    "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

    // this rule prevents us from type checking elements
    "xss/no-mixed-html": "off",

    // disable secrets and PII rules (they don't really apply to us)
    "no-secrets/no-secrets": "off",
    "pii/no-phone-number": "off",

    // let me have my src attributes >:(
    "scanjs-rules/assign_to_src": "off",

    /**
     *  Optional or Temporary Rules
     */

    // This rule crashes!
    "@typescript-eslint/no-invalid-this": "off",

    // we can remove this once TS 5.1 drops
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

    // need more time for top-level await to be supported in browsers
    "unicorn/prefer-top-level-await": "off",

    // the following rules seem annoying, so I've loosened them up (that way they can at least stay on)
    // the goal should probably be to decrease these over time
    complexity: ["warn", 40],
    "sonarjs/cognitive-complexity": ["warn", 40],
    "max-params": ["warn", 6],
    "consistent-return": "off",
    "no-nested-ternary": "warn",
    "const-case/uppercase": "off",
    "eslint-comments/disable-enable-pair": "off",
    "scanjs-rules/identifier_localStorage": "off",
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
