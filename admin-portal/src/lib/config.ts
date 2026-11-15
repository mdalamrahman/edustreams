const env = import.meta.env;
export const config = {
  backendUrl: String(env.VITE_BACKEND_URL || '').replace(/\/$/, ''),
  studentUrl: String(env.VITE_STUDENT_URL || '').replace(/\/$/, ''),
  supabaseUrl: String(env.VITE_SUPABASE_URL || '').replace(/\/$/, ''),
  supabaseKey: String(env.VITE_SUPABASE_ANON_KEY || ''),
};
for (const [name, value] of Object.entries(config)) {
  if (!value) throw new Error(`Missing admin configuration: ${name}`);
}
