import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
  console.log('Testing passkey sync via Supabase Admin API...');
  
  // 1. Find admin user
  const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error('List users error:', listErr);
    return;
  }

  const adminUser = usersData.users.find(u => u.email === 'mdalamrahman4@gmail.com');
  console.log('Admin user found:', adminUser?.id, adminUser?.email);

  if (!adminUser) return;

  const testCode = 'SDE-999111';
  const testExpiresAt = Date.now() + 600000;

  // 2. Set passkey in user_metadata
  const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    adminUser.id,
    {
      user_metadata: {
        ...adminUser.user_metadata,
        dynamic_passkey: {
          code: testCode,
          expiresAt: testExpiresAt,
          createdAt: Date.now(),
          generatedBy: adminUser.email
        }
      }
    }
  );

  console.log('Update result:', { success: !!updateData, error: updateErr });

  // 3. Read it back as any client
  const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(adminUser.id);
  console.log('Read back dynamic passkey from Supabase:', verifyData?.user?.user_metadata?.dynamic_passkey);
}

test();
