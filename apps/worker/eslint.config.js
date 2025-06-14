import baseConfig from "@acme/eslint-config/base";
import reactConfig from "@acme/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["temp/**", "public/**"],
  },
  ...baseConfig,
  ...reactConfig,
  // ...restrictEnvAccess,
];
