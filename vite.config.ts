import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Support both GEMINI_API_KEY (legacy) and VITE_GEMINI_API_KEY (standard Vite)
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      // Firebase env vars
      'import.meta.env.VITE_FIREBASE_API_KEY':            JSON.stringify(env.VITE_FIREBASE_API_KEY            || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN':        JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN        || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID':         JSON.stringify(env.VITE_FIREBASE_PROJECT_ID         || ''),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET':     JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET     || ''),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID':JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID|| ''),
      'import.meta.env.VITE_FIREBASE_APP_ID':             JSON.stringify(env.VITE_FIREBASE_APP_ID             || ''),
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
    },
  };
});
