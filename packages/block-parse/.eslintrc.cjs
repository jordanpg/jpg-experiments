require("@rushstack/eslint-patch/modern-module-resolution");

/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["@repo/eslint-config/library.js"],
    plugins: ["vitest"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.lint.json",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["vitest.config.ts", "rslib.config.ts"],
};
