import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The dev server proxies /api to the backend, so the API needs no CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
