import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          if (id.includes('node_modules/@react-three')) {
            return 'r3f';
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) {
            return 'gsap';
          }
          if (id.includes('node_modules/lenis')) {
            return 'lenis';
          }
        },
      },
    },
  },
});
