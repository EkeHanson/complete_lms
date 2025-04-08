import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['date-fns'],
  },
  ssr: {
    noExternal: ['date-fns'], // Add this line
  },
});