import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    cssInjectedByJsPlugin({topExecutionPriority: false}),
  ],
  server: {
    port: 3001,
    strictPort: true,
  },
  build: {
    lib: {
      formats: ['es'],
      entry: './src/main.js',
      name: 'sumobubble-wc',
      fileName: 'sumobubble'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
