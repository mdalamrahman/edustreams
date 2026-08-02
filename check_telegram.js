const https = require('https');

const BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI';

function apiCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}?${query}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== Checking Telegram Bot Credentials & Channel Updates ===');
  
  const updates = await apiCall('getUpdates');
  console.log('getUpdates Result:\n', JSON.stringify(updates, null, 2));

  const channels = [
    { name: 'DSA', ids: [-4390749731, -1004390749731, -10024390749731] },
    { name: 'System Design', ids: [-4329144420, -1004329144420] },
    { name: 'DBMS', ids: [-4332462419, -1004332462419] },
    { name: 'Computer Networks', ids: [-4308430774, -1004308430774] }
  ];

  for (const ch of channels) {
    for (const cid of ch.ids) {
      try {
        const res = await apiCall('getChat', { chat_id: cid });
        if (res.ok) {
          console.log(`[FOUND CHAT] ${ch.name} (ID: ${cid}):`, res.result.title || res.result.username);
        } else {
          console.log(`[CHAT INFO] ${ch.name} (ID: ${cid}):`, res.description);
        }
      } catch (err) {
        console.error(`Error for ${ch.name} (${cid}):`, err.message);
      }
    }
  }
}

main();
