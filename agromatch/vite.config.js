import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    // En carpetas montadas de Windows (/mnt/c) el vigilante de archivos por
    // eventos no funciona y Vite sirve codigo viejo. Con polling, los cambios
    // se detectan siempre. Es lo que hacia que se viera una version antigua.
    watch: { usePolling: true, interval: 400 },
  },
  preview: { host: true, port: 4173 },
});
