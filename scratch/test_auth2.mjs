import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njg2MTUsImV4cCI6MjEwMTE0NDYxNX0._mAndBqpnJdoTdTfAS4bx0_XQKtrC5n4GevwBZWr9uM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data: signupData, error: signupErr } = await supabase.auth.signUp({
    email: 'mdalamrahman4@gmail.com',
    password: 'Zerocheck@8100648132'
  });
  console.log('SignUp result for mdalamrahman4@gmail.com:', { 
    user: signupData?.user?.email, 
    id: signupData?.user?.id,
    session: !!signupData?.session,
    error: signupErr?.message 
  });
}

test();
