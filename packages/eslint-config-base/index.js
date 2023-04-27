module.exports = {
  extends: [
    /**
     * Bring in @typescript-eslint rules and react rules for TS checking
     */
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    /**
     * The base for this config is alloy
     */
    "alloy",
    "alloy/react",
    "alloy/typescript",
    /**
     * and some utility plugins with extra rules
     */
    "adjunct", // several useful rules
    "plugin:compat/recommended", // browser compatibility
    "plugin:jsx-a11y/recommended", // a11y for react elements
    "plugin:listeners/strict", // strict event listeners
    "plugin:prettier/recommended", // disable any pure style rules (of which there should be none)
    "plugin:ssr-friendly/recommended", // no window access
    "plugin:styled-components-a11y/recommended", // a11y for styled components
  ],
  plugins: [
    "@typescript-eslint",
    "compat",
    "function-component-export",
    "jsx-a11y",
    "listeners",
    "prettier",
    "react",
    "react-hooks",
    "sort-styled-components",
    "ssr-friendly",
    "styled-components-a11y",
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

    // defining styled components at the bottom is nicer for readability but incompatible with this rule
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

    // disallow shadowing
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
    "unicorn/no-array-callback-reference": "off",
    "unicorn/no-useless-undefined": ["error", { checkArguments: false }],

    // this rule prevents us from type checking elements
    "xss/no-mixed-html": "off",

    // disable secrets and PII rules (they don't really apply to us)
    "no-secrets/no-secrets": "off",
    "pii/no-phone-number": "off",

    /**
     *  Optional or Temporary Rules
     */

    // we can remove this once TS 5.1 drops
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

    // we need more time for top-level await to be supported in browsers
    "unicorn/prefer-top-level-await": "off",

    // the following rules seem annoying, so I've loosened them up (that way they can at least stay on)
    // the goal should probably be to decrease these over time
    complexity: ["warn", 40],
    "sonarjs/cognitive-complexity": ["warn", 40],
    "max-params": ["warn", 6],

    // similar story with these, but I've entirely disabled them
    "no-nested-ternary": "warn",
    "consistent-return": "off",
    "const-case/uppercase": "off",
    "eslint-comments/disable-enable-pair": "off",
    "scanjs-rules/identifier_localStorage": "off",
    "scanjs-rules/assign_to_src": "off",
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
