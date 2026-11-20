import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: o build funciona em qualquer pasta (servidor, Coolify ou prévia)
export default defineConfig({ plugins: [react()], base: './' });
