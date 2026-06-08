import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/tinymce/**', 'dist/**', 'coverage/**']
  },
  {
    rules: {
      'no-unused-vars': 'off',
      // Next 16's eslint preset enables this. Flags any setState() in
      // useEffect as a smell ("you might not need an effect"). We have
      // several places that do this for legitimate prop/store -> local
      // state sync; refactor as a separate cleanup pass.
      'react-hooks/set-state-in-effect': 'off'
    }
  }
];

export default config;
