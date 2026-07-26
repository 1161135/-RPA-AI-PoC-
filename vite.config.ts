import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves project sites below the repository name. Keep local
  // development at the root path so `npm run dev` remains straightforward.
  base: process.env.GITHUB_ACTIONS ? '/-RPA-AI-PoC-/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
