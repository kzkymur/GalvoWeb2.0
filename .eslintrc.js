const root = __dirname;

module.exports = {
  env: {
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: root + "/tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {},
  root: true,
};
