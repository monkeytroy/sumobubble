import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Only run unit tests under __tests__. The e2e/ and tests-examples/
    // directories hold Playwright specs which would fail under vitest.
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}']
  },
  resolve: {
    alias: {
      // Mirrors tsconfig.json "@/*" -> "./*". Was previously '@': '/'
      // which pointed at the filesystem root.
      '@': path.resolve(__dirname, '.')
    }
  }
});
