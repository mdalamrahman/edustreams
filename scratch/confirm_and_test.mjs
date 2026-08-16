import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njg2MTUsImV4cCI6MjEwMTE0NDYxNX0._mAndBqpnJdoTdTfAS4bx0_XQKtrC5n4GevwBZWr9uM';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function confirmAndTest() {
  console.log('1. Confirming mdalamrahman4@gmail.com...');
  const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    'd0f83a4a-d9ca-4c01-98e6-111f9a962a95',
    { email_confirm: true, password: 'Zerocheck@8100648132' }
  );
  console.log('Update result:', { email: updateData?.user?.email, confirmed: updateData?.user?.email_confirmed_at, error: updateErr?.message });

  console.log('\n2. Testing signInWithPassword now with password Zerocheck@8100648132...');
  const { data: signinData, error: signinErr } = await supabaseAnon.auth.signInWithPassword({
    email: 'mdalamrahman4@gmail.com',
    password: 'Zerocheck@8100648132'
  });
  console.log('SignIn result:', {
    user: signinData?.user?.email,
    sessionToken: !!signinData?.session?.access_token,
    error: signinErr?.message
  });
}

confirmAndTest();
