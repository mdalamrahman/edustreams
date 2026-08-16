import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njg2MTUsImV4cCI6MjEwMTE0NDYxNX0._mAndBqpnJdoTdTfAS4bx0_XQKtrC5n4GevwBZWr9uM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing Supabase Auth on:', SUPABASE_URL);

  // Try sign in
  const { data: signinData, error: signinErr } = await supabase.auth.signInWithPassword({
    email: 'mdalamrahman4@gmail.com',
    password: 'password123'
  });
  console.log('SignIn result:', { user: signinData?.user?.email, error: signinErr?.message, status: signinErr?.status });

  // Try sign up
  const { data: signupData, error: signupErr } = await supabase.auth.signUp({
    email: 'testcandidate@sdetube.edu',
    password: 'TestPassword123!'
  });
  console.log('SignUp result:', { user: signupData?.user?.email, error: signupErr?.message, status: signupErr?.status });
}

test();
