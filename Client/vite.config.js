// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Correctly resolves Material-UI imports
      '@material-ui/core': 'node_modules/@material-ui/core',
    },
  },
});

