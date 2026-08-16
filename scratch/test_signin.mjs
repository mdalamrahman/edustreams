import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njg2MTUsImV4cCI6MjEwMTE0NDYxNX0._mAndBqpnJdoTdTfAS4bx0_XQKtrC5n4GevwBZWr9uM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAll() {
  const users = [
    'mdalamrahman4@gmail.com',
    'candidate@sdetube.edu',
    'student@edustream.org'
  ];

  for (const email of users) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Zerocheck@8100648132'
    });
    console.log(`SignIn for ${email}:`, {
      success: !!data?.user,
      id: data?.user?.id,
      error: error?.message
    });
  }
}

testAll();
