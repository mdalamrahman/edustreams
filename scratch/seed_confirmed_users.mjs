import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seedUsers() {
  const users = [
    { email: 'candidate@sdetube.edu', password: 'Zerocheck@8100648132', role: 'candidate' },
    { email: 'student@edustream.org', password: 'Zerocheck@8100648132', role: 'student' }
  ];

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role }
    });
    console.log(`Created user ${u.email}:`, { id: data?.user?.id, error: error?.message });
  }

  const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
  console.log('\nAll Supabase Users:');
  for (const u of allUsers.users) {
    console.log(`- ${u.email} (Confirmed: ${u.email_confirmed_at ? 'YES' : 'NO'})`);
  }
}

seedUsers();
