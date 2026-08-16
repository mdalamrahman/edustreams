import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function removePlaceholders() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (data?.users) {
    for (const u of data.users) {
      if (u.email === 'candidate@sdetube.edu' || u.email === 'student@edustream.org') {
        console.log(`Deleting placeholder user ${u.email} (${u.id})...`);
        await supabaseAdmin.auth.admin.deleteUser(u.id);
      }
    }
  }

  const { data: remaining } = await supabaseAdmin.auth.admin.listUsers();
  console.log('\nRemaining authentic Supabase Users:');
  for (const u of remaining.users) {
    console.log(`- ${u.email} (ID: ${u.id})`);
  }
}

removePlaceholders();
