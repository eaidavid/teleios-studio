import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// base relativa por padrão (funciona em qualquer pasta); no servidor usamos VITE_BASE=/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), previa: resolve(__dirname, 'previa.html') } } },
  server: { proxy: { '/api': 'http://localhost:3000', '/p/': 'http://localhost:3000' } },
});
