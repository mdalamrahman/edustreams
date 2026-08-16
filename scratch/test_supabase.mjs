import { createClient } from '@supabase/supabase-js';

const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

console.log('Testing connection to:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    const { data: channels, error: chErr } = await supabase.from('channels').select('*');
    console.log('Channels result:', { count: channels?.length, data: channels, error: chErr?.message });

    const { data: videos, count: vCount, error: vErr } = await supabase.from('videos').select('id, title, duration_seconds, transcript', { count: 'exact' });
    console.log('Videos result:', { count: vCount || videos?.length, error: vErr?.message });

    const { data: attempts, count: attCount, error: attErr } = await supabase.from('question_attempts').select('*', { count: 'exact' });
    console.log('Attempts result:', { count: attCount || attempts?.length, data: attempts, error: attErr?.message });

    const { data: analytics, count: anCount, error: anErr } = await supabase.from('user_analytics').select('*', { count: 'exact' });
    console.log('Analytics result:', { count: anCount || analytics?.length, data: analytics, error: anErr?.message });
  } catch (err) {
    console.error('Exception querying Supabase:', err.message);
  }
}

run();
