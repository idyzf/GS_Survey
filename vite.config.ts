import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works under the GitHub Pages sub-path (/GS_Survey/).
  base: './',
  plugins: [react(), tailwindcss()],
});
