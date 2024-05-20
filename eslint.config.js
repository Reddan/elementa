import StylisticPlugin from "@stylistic/eslint-plugin"
import parserTs from "@typescript-eslint/parser"
import SimpleImportSortPlugin from "eslint-plugin-simple-import-sort"

export default [{
  languageOptions: {
    parser: parserTs,
    ecmaVersion: 12,
    sourceType: "module",
  },
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  plugins: {
    "@stylistic": StylisticPlugin,
    "simple-import-sort": SimpleImportSortPlugin,
  },
  rules: {
    "@/no-irregular-whitespace": "error",
    "@/no-var": "error",
    "@/prefer-const": "error",
    "@stylistic/array-bracket-newline": ["error", "consistent"],
    "@stylistic/array-bracket-spacing": ["error", "never"],
    "@stylistic/array-element-newline": ["error", "consistent"],
    "@stylistic/arrow-parens": ["error", "as-needed"],
    "@stylistic/arrow-spacing": ["error", {before: true, after: true}],
    "@stylistic/brace-style": ["error", "1tbs"],
    "@stylistic/comma-dangle": ["error", "always-multiline"],
    "@stylistic/comma-spacing": ["error", {before: false, after: true}],
    "@stylistic/comma-style": ["error", "last"],
    "@stylistic/computed-property-spacing": ["error", "never"],
    "@stylistic/eol-last": ["error", "always"],
    "@stylistic/function-call-spacing": ["error", "never"],
    "@stylistic/implicit-arrow-linebreak": ["error", "beside"],
    "@stylistic/indent": ["error", 2],
    "@stylistic/indent-binary-ops": ["error", 2],
    "@stylistic/jsx-closing-bracket-location": "error",
    "@stylistic/jsx-closing-tag-location": "error",
    "@stylistic/jsx-curly-brace-presence": "error",
    "@stylistic/jsx-curly-spacing": "error",
    "@stylistic/jsx-equals-spacing": "error",
    "@stylistic/jsx-first-prop-new-line": "error",
    "@stylistic/jsx-indent": ["error", 2],
    "@stylistic/jsx-quotes": ["error", "prefer-double"],
    "@stylistic/jsx-tag-spacing": ["error", {closingSlash: "never", beforeSelfClosing: "always", beforeClosing: "never"}],
    "@stylistic/jsx-wrap-multilines": ["error", {
      declaration: "parens-new-line",
      assignment: "parens-new-line",
      return: "parens-new-line",
      arrow: "parens-new-line",
      condition: "parens-new-line",
      logical: "parens-new-line",
      prop: "parens-new-line",
    }],
    "@stylistic/key-spacing": ["error", {beforeColon: false, afterColon: true}],
    "@stylistic/keyword-spacing": "error",
    "@stylistic/member-delimiter-style": ["error", {singleline: {delimiter: "comma"}, multiline: {delimiter: "none"}}],
    "@stylistic/no-multi-spaces": "error",
    "@stylistic/no-multiple-empty-lines": ["error", {max: 1, maxBOF: 0, maxEOF: 0}],
    "@stylistic/no-trailing-spaces": "error",
    "@stylistic/object-curly-newline": ["error", {consistent: true}],
    "@stylistic/object-curly-spacing": ["error", "never"],
    "@stylistic/object-property-newline": ["error", {allowAllPropertiesOnSameLine: true}],
    "@stylistic/operator-linebreak": [2, "before"],
    "@stylistic/padded-blocks": ["error", "never"],
    "@stylistic/quote-props": ["error", "as-needed"],
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/semi": ["error", "never"],
    "@stylistic/space-before-blocks": ["error", "always"],
    "@stylistic/space-before-function-paren": ["error", {anonymous: "never", named: "never", asyncArrow: "always"}],
    "@stylistic/space-in-parens": ["error", "never"],
    "@stylistic/space-infix-ops": "error",
    "@stylistic/space-unary-ops": "error",
    "@stylistic/template-curly-spacing": "error",
    "@stylistic/type-annotation-spacing": "error",
    "@stylistic/type-generic-spacing": "error",
    "@stylistic/type-named-tuple-spacing": "error",

    "simple-import-sort/imports": ["error", {
      // Default: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]];
      groups: [[
        // Side effect imports.
        "^\\u0000",
        // Packages `solid` related packages come first.
        "^solid-js",
        "^solid",
        "^@?\\w",
        // Internal packages.
        "^~/types",
        "^~/",
        // Parent imports. Put `..` last.
        "^\\.\\.(?!/?$)",
        "^\\.\\./?$",
        // Other relative imports. Put same-folder imports and `.` last.
        "^\\./(?=.*/)(?!/?$)",
        "^\\.(?!/?$)",
        "^\\./?$",
      ]],
    }],
  },
}]
