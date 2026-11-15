function configuredUrl(value: unknown, name: string, required = false): string {
  const raw = String(value || '').trim();
  if (!raw) {
    if (required) throw new Error(`Missing required configuration: ${name}`);
    return '';
  }
  const url = new URL(raw);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Invalid URL: ${name}`);
  return url.href.replace(/\/$/, '');
}

const env = import.meta.env || (typeof process !== 'undefined' ? process.env : {});
export const repositoryConfig = {
  backendUrl: configuredUrl(env.VITE_BACKEND_URL || env.VITE_RENDER_BACKEND_URL, 'VITE_BACKEND_URL'),
  studentUrl: configuredUrl(env.VITE_STUDENT_URL, 'VITE_STUDENT_URL') || (typeof window !== 'undefined' ? window.location.origin : ''),
  supabaseUrl: configuredUrl(env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL', true),
  supabaseKey: String(env.VITE_SUPABASE_ANON_KEY || ''),
};
if (!repositoryConfig.supabaseKey) throw new Error('Missing required configuration: VITE_SUPABASE_ANON_KEY');
