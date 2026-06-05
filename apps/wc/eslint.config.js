import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.min.js', '*.cjs'],
  },
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        customElements: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        setTimeout: 'readonly',
        FormData: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': 'off',
    },
  },
];
