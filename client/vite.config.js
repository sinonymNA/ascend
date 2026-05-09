import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    preview: {
      allowedHosts: ['ascend-production-db3c.up.railway.app'],
    },
    allowedHosts: ['ascend-production-db3c.up.railway.app'],
  },
});
