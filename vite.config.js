import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/airtable': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/img': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/submit': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/rate': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ratings': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/preview': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/billing': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
