// Fetch actual messages from Telegram channels using Bot API
// Bot must be admin of the channels
const https = require('https');

const BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI';
const CHANNELS = {
  'Striver DSA': -1004390749731,
  'STRIVER LLD': -1004329144420,
  'Striver DBMS': -1004332462419,
  'Striver CN': -1004308430774
};

function apiCall(method, params) {
  return new Promise(function(resolve, reject) {
    const qs = params ? '?' + Object.entries(params).map(function(e) { return e[0] + '=' + encodeURIComponent(e[1]); }).join('&') : '';
    const url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/' + method + qs;
    https.get(url, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== STEP 1: Check Bot Info ===');
  const me = await apiCall('getMe');
  console.log('Bot:', me.result.first_name, '(@' + me.result.username + ')');

  console.log('\n=== STEP 2: Get Recent Updates (channel_post messages) ===');
  const updates = await apiCall('getUpdates', { limit: 100, timeout: 0 });
  
  if (updates.ok && updates.result.length > 0) {
    console.log('Total updates:', updates.result.length);
    
    for (const update of updates.result) {
      const msg = update.channel_post || update.message;
      if (!msg) continue;
      
      const chatTitle = msg.chat ? msg.chat.title : 'Unknown';
      const chatId = msg.chat ? msg.chat.id : 'N/A';
      const msgId = msg.message_id;
      const caption = msg.caption || msg.text || '(no text)';
      
      console.log('\n--- Message #' + msgId + ' from [' + chatTitle + '] (Chat ID: ' + chatId + ') ---');
      console.log('  Caption:', caption.substring(0, 120));
      console.log('  Date:', new Date(msg.date * 1000).toISOString());
      
      if (msg.video) {
        console.log('  >>> VIDEO FOUND <<<');
        console.log('    file_id:', msg.video.file_id);
        console.log('    file_unique_id:', msg.video.file_unique_id);
        console.log('    duration:', msg.video.duration, 'seconds');
        console.log('    width:', msg.video.width, 'height:', msg.video.height);
        console.log('    file_size:', msg.video.file_size, 'bytes (' + Math.round(msg.video.file_size / 1024 / 1024) + ' MB)');
        console.log('    mime_type:', msg.video.mime_type);
        
        // Try to get file download path (works for files < 20MB)
        try {
          const fileInfo = await apiCall('getFile', { file_id: msg.video.file_id });
          if (fileInfo.ok) {
            console.log('    file_path:', fileInfo.result.file_path);
            console.log('    download_url: https://api.telegram.org/file/bot' + BOT_TOKEN + '/' + fileInfo.result.file_path);
          } else {
            console.log('    getFile error:', fileInfo.description);
          }
        } catch(e) {
          console.log('    getFile failed:', e.message);
        }
      }
      
      if (msg.document) {
        console.log('  >>> DOCUMENT FOUND <<<');
        console.log('    file_id:', msg.document.file_id);
        console.log('    file_name:', msg.document.file_name || 'unnamed');
        console.log('    file_size:', msg.document.file_size, 'bytes');
        console.log('    mime_type:', msg.document.mime_type);
      }
      
      if (msg.audio) {
        console.log('  >>> AUDIO FOUND <<<');
        console.log('    file_id:', msg.audio.file_id);
        console.log('    duration:', msg.audio.duration, 'seconds');
      }
      
      if (msg.photo && msg.photo.length > 0) {
        const largest = msg.photo[msg.photo.length - 1];
        console.log('  >>> PHOTO FOUND <<<');
        console.log('    file_id:', largest.file_id);
        console.log('    size:', largest.width + 'x' + largest.height);
      }
    }
  } else {
    console.log('No recent updates found via getUpdates.');
    console.log('This is normal - Bot API getUpdates only returns unprocessed incoming messages.');
    console.log('For full channel history, we need Telethon MTProto.');
  }

  // Also try getting webhook info to see if a webhook is consuming updates
  console.log('\n=== STEP 3: Check Webhook Status ===');
  const webhook = await apiCall('getWebhookInfo');
  console.log('Webhook URL:', webhook.result.url || '(none)');
  console.log('Pending updates:', webhook.result.pending_update_count || 0);
}

main().catch(function(err) { console.error('Error:', err); });
