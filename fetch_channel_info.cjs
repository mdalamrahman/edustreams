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
  const channels = [
    { key: 'DSA', cid: -1004390749731 },
    { key: 'System Design', cid: -1004329144420 },
    { key: 'DBMS', cid: -1004332462419 },
    { key: 'Computer Networks', cid: -1004308430774 }
  ];

  for (const ch of channels) {
    const chat = await apiCall('getChat', { chat_id: ch.cid });
    const count = await apiCall('getChatMemberCount', { chat_id: ch.cid });
    console.log(`=== ${ch.key} ===`);
    console.log('Title:', chat.result?.title);
    console.log('Description:', chat.result?.description);
    console.log('Member Count:', count.result);
  }
}

main();
