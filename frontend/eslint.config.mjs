import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  ...nextVitals,
  prettierRecommended,
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal', 'parent', 'sibling', 'index']],
          'newlines-between': 'never'
        }
      ]
    }
  },
  globalIgnores(['*.js', '*.mjs', '*.cjs'])
]);
