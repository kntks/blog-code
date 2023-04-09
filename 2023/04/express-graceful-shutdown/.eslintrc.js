module.exports = {
  env: {
    "es2021": true
    // "node": true, 
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier", 
  ],
  plugins: [
    "@typescript-eslint"
  ],
  parserOptions: {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
};