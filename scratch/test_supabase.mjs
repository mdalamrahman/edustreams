import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njg2MTUsImV4cCI6MjEwMTE0NDYxNX0._mAndBqpnJdoTdTfAS4bx0_XQKtrC5n4GevwBZWr9uM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('Testing live Supabase connection to:', SUPABASE_URL);
  
  const { data: channels, error: chErr } = await supabase.from('channels').select('*');
  console.log('Channels:', { count: channels?.length, error: chErr?.message });

  const { data: videos, count: vCount, error: vErr } = await supabase.from('videos').select('id, title', { count: 'exact' });
  console.log('Videos:', { count: vCount, error: vErr?.message });

  const { data: attempts, error: attErr } = await supabase.from('question_attempts').select('*');
  console.log('Question Attempts:', { count: attempts?.length, error: attErr?.message });

  const { data: analytics, error: anErr } = await supabase.from('user_analytics').select('*');
  console.log('User Analytics:', { count: analytics?.length, error: anErr?.message });
}

run();
