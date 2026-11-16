import { defineConfig } from '@playwright/test';

const env = {
  VITE_SUPABASE_URL: 'https://preview-test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'public-browser-test-key',
  VITE_BACKEND_URL: 'https://backend.example.test',
  VITE_STUDENT_URL: 'http://127.0.0.1:4173',
  VITE_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
};

export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  workers: 1,
  use: { channel: 'chrome', viewport: { width: 1280, height: 900 }, screenshot: 'only-on-failure', serviceWorkers: 'block' },
  webServer: [
    { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', env, reuseExistingServer: false },
    { command: 'npm --prefix admin-portal run dev -- --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174', env, reuseExistingServer: false },
  ],
});
