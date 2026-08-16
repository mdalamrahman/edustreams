import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
  console.log('Testing Supabase table for passkeys...');
  const { data, error } = await supabaseAdmin
    .from('auth_passkeys')
    .select('*');
  
  console.log('Query result:', { data, error: error?.message });
}

test();
