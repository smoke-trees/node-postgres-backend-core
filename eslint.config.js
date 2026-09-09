const plugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  ...plugin.configs["flat/recommended"],
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];
