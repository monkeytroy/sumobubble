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
  // Narrow shim for libs (Vue, headlessui, etc.) that read
  // process.env.NODE_ENV at runtime. Replaces ONLY that one identifier
  // with a string literal — not the whole `process.env` (which would
  // leak any env var defined at build time into the shipped bundle).
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
