// eslint.config.mjs
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { ESLint } from 'eslint';

export default ESLint.Config({
  ignores: ['eslint.config.mjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // Chỉ ra tệp tsconfig để TypeScript có thể được phân tích cú pháp chính xác.
    tsconfigRootDir: import.meta.dir, // Đảm bảo rằng tsconfig được trỏ tới đúng thư mục.
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    // Bạn có thể thêm các quy tắc khác nếu cần
  },
  env: {
    node: true,
    jest: true,
  },
  globals: {
    ...globals.node,
    ...globals.jest,
  },
});
