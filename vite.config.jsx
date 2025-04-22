import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',  // This fixes the 'global is not defined' error
  },
  optimizeDeps: {
    include: ['date-fns'],
  },
  ssr: {
    noExternal: ['date-fns'],
  },
});