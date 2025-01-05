import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        { src: '_redirects', dest: 'dist' }, // Copia el archivo _redirects a la carpeta dist
      ],
      hook: 'writeBundle', // Ejecuta la copia después de construir
    }),
  ],
});
