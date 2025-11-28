import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const isProduction = process.env.NODE_ENV === "production";
const isRelease = process.env.RELEASE === "true";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "eslint.config.js"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // 프로젝트 전반에 적용할 커스텀 규칙 및 환경별 규칙
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
      camelcase: ["error", { properties: "always" }],
      "comma-spacing": ["error", { before: false, after: true }],
      "space-infix-ops": "error",
      // indent: ["error", 2],
      "max-statements-per-line": ["error", { max: 1 }],
      "new-cap": ["error", { capIsNewExceptions: ["Router"] }],

      // 환경별 규칙
      "no-console": isRelease ? "error" : isProduction ? "warn" : "off",
      "no-debugger": isRelease ? "error" : "warn",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": isProduction
        ? ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }]
        : [
            "warn",
            {
              varsIgnorePattern: "^[A-Z_]|^(temp|test|dummy)",
              argsIgnorePattern: "^_",
            },
          ],

      ...(isProduction && {
        "prefer-const": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "no-multiple-empty-lines": ["error", { max: 2 }],
      }),
    },
  }
);
