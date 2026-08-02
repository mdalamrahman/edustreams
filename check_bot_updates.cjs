const https = require('https');
const BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI';

function api(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(params));
    req.end();
  });
}

async function main() {
  console.log("Checking bot updates & chat info...");
  const me = await api('getMe');
  console.log("Bot:", me.result.first_name, "(@"+me.result.username+")");

  // Check Webhook
  const webhook = await api('getWebhookInfo');
  console.log("Webhook:", webhook.result);

  // Get updates
  const updates = await api('getUpdates', { limit: 100 });
  console.log("Updates count:", updates.result ? updates.result.length : 0);
  if (updates.result && updates.result.length > 0) {
    for (const u of updates.result) {
      console.log("Update:", JSON.stringify(u, null, 2));
    }
  }
}

main().catch(console.error);
