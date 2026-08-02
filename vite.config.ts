import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || env.VITE_RENDER_BACKEND_URL || 'https://edustream-backend-90vm.onrender.com';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        // Proxy stream requests to Telethon backend
        '/stream': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Proxy download requests to Telethon backend
        '/api/download': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Proxy catalog requests to Telethon backend
        '/api/catalog': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Proxy compile/AI requests to backend
        '/api/compile': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api/ai': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
