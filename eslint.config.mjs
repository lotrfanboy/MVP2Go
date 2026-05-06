import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Minimal ESLint flat config for Next.js 15 + TypeScript strict.
 *
 * `eslint-config-next` 15.x relies on `@rushstack/eslint-patch` which conflicts
 * with ESLint 9 when invoked via the deprecated `next lint`. We therefore call
 * the ESLint CLI directly and stick to widely-supported plugins. Next-specific
 * rules (e.g. core-web-vitals) can be reintroduced when eslint-config-next
 * ships a stable flat-config export, or after migrating to Next 16.
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // JSX implicitly references React types; not exhaustively linted here.
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/db/migrations/**",
      "next-env.d.ts",
      "global.d.ts",
    ],
  },
];
