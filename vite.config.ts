import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ["**/backend/**"],
      },
      proxy: {
        '/auth': 'http://127.0.0.1:4000',
        '/students': 'http://127.0.0.1:4000',
        '/elections': 'http://127.0.0.1:4000',
        '/voters': 'http://127.0.0.1:4000',
        '/votes': 'http://127.0.0.1:4000',
        '/verification': 'http://127.0.0.1:4000',
        '/audit-logs': 'http://127.0.0.1:4000',
        '/health': 'http://127.0.0.1:4000',
      },
    },
  };
});
