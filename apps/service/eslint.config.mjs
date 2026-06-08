import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/tinymce/**', 'dist/**', 'coverage/**']
  },
  {
    rules: {
      'no-unused-vars': 'off'
    }
  }
];

export default config;
