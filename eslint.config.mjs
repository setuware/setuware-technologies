import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated or tool-owned output.
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    rules: {
      /*
       * A leading underscore marks a binding that exists only to be
       * destructured away — `const { honeypot: _honeypot, ...lead } = body` is
       * how the route handlers strip anti-spam fields before forwarding.
       */
      /*
       * `set-state-in-effect` cannot distinguish a render cascade from a
       * mount-time read of an external system, and it reports the whole
       * effect rather than the offending call, so inline suppression does not
       * land. Every remaining instance is the latter: reading localStorage,
       * `matchMedia` availability, the URL, or reacting to a route change —
       * none of which can be done during render.
       *
       * Where React provides a proper API we use it: `useMediaQuery` and
       * `useHydrated` are built on `useSyncExternalStore`. Kept as a warning
       * so new instances stay visible and get the same scrutiny.
       */
      "react-hooks/set-state-in-effect": "warn",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
