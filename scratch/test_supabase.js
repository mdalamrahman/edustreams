const { createClient } = require('@supabase/supabase-js');

const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

console.log('Testing connection to:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    const { data: channels, error: chErr } = await supabase.from('channels').select('*');
    console.log('Channels result:', { count: channels?.length, error: chErr?.message });

    const { data: videos, error: vErr } = await supabase.from('videos').select('id, title, duration_seconds', { count: 'exact' });
    console.log('Videos result:', { count: videos?.length, error: vErr?.message });

    const { data: attempts, error: attErr } = await supabase.from('question_attempts').select('*');
    console.log('Attempts result:', { count: attempts?.length, error: attErr?.message });

    const { data: analytics, error: anErr } = await supabase.from('user_analytics').select('*');
    console.log('Analytics result:', { count: analytics?.length, error: anErr?.message });
  } catch (err) {
    console.error('Exception querying Supabase:', err.message);
  }
}

run();
