/** @type {import("eslint").Linter.Config} */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: ['@repo/eslint-config/react-internal.js'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.lint.json',
        tsconfigRootDir: __dirname,
    },
};
