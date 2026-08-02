/**
 * EduStream — Telegram Channel Content Discovery via GramJS (MTProto)
 * Fetches ALL messages from the 4 Striver Telegram channels,
 * discovering videos, documents, photos, and their metadata.
 */
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const fs = require('fs');
const path = require('path');

// Telegram API Credentials
const API_ID = 37503742;
const API_HASH = 'e9418514754885f7a01050ca1d2997b1';
const BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI';

const CHANNELS = [
  { name: 'Striver DSA', id: -1004390749731, category: 'DSA' },
  { name: 'STRIVER LLD', id: -1004329144420, category: 'System Design' },
  { name: 'Striver DBMS', id: -1004332462419, category: 'DBMS' },
  { name: 'Striver CN', id: -1004308430774, category: 'Computer Networks' },
];

async function main() {
  console.log('=== EduStream Telegram MTProto Channel Scanner ===\n');

  const client = new TelegramClient(
    new StringSession(''),
    API_ID,
    API_HASH,
    { connectionRetries: 3 }
  );

  // Start as bot
  await client.start({ botAuthToken: BOT_TOKEN });
  console.log('✓ Connected to Telegram MTProto as bot\n');

  const allContent = {};

  for (const channel of CHANNELS) {
    console.log(`\n========== ${channel.name} (${channel.id}) ==========`);
    allContent[channel.category] = { channel: channel, messages: [] };

    try {
      // Fetch up to 100 messages from this channel
      const messages = await client.getMessages(channel.id, { limit: 100 });
      console.log(`Found ${messages.length} total messages in ${channel.name}`);

      let videoCount = 0;
      let docCount = 0;
      let photoCount = 0;
      let textCount = 0;

      for (const msg of messages) {
        const msgData = {
          message_id: msg.id,
          date: msg.date ? new Date(msg.date * 1000).toISOString() : null,
          text: msg.message || '',
          has_video: false,
          has_document: false,
          has_photo: false,
          video: null,
          document: null,
          photo: null,
        };

        // Check for video
        if (msg.video) {
          videoCount++;
          msgData.has_video = true;
          msgData.video = {
            file_id: msg.video.id ? msg.video.id.toString() : null,
            access_hash: msg.video.accessHash ? msg.video.accessHash.toString() : null,
            file_reference: msg.video.fileReference ? Buffer.from(msg.video.fileReference).toString('base64') : null,
            duration: msg.video.duration,
            width: msg.video.w,
            height: msg.video.h,
            size: msg.video.size ? Number(msg.video.size) : 0,
            mime_type: msg.video.mimeType,
            thumb: msg.video.thumbs ? msg.video.thumbs.length : 0,
          };
          console.log(`  [VIDEO] Msg #${msg.id}: ${(msgData.video.size / 1024 / 1024).toFixed(1)}MB, ${msgData.video.duration}s, ${msgData.video.width}x${msgData.video.height}`);
          if (msgData.text) console.log(`    Caption: ${msgData.text.substring(0, 100)}`);
        }

        // Check for document (media could also be in msg.media)
        if (msg.document && !msg.video) {
          docCount++;
          msgData.has_document = true;
          msgData.document = {
            file_id: msg.document.id ? msg.document.id.toString() : null,
            access_hash: msg.document.accessHash ? msg.document.accessHash.toString() : null,
            file_name: null,
            mime_type: msg.document.mimeType,
            size: msg.document.size ? Number(msg.document.size) : 0,
          };
          // Extract file name from attributes
          if (msg.document.attributes) {
            for (const attr of msg.document.attributes) {
              if (attr.fileName) {
                msgData.document.file_name = attr.fileName;
              }
            }
          }
          console.log(`  [DOC] Msg #${msg.id}: ${msgData.document.file_name || 'unnamed'} (${msgData.document.mime_type}, ${(msgData.document.size / 1024).toFixed(0)}KB)`);
        }

        // Check if media object exists (GramJS stores media differently)
        if (msg.media) {
          const media = msg.media;
          
          // Video in media wrapper
          if (media.className === 'MessageMediaDocument' && media.document) {
            const doc = media.document;
            const isVideo = (doc.mimeType && doc.mimeType.startsWith('video/'));
            const hasVideoAttr = doc.attributes && doc.attributes.some(function(a) { return a.className === 'DocumentAttributeVideo'; });
            
            if ((isVideo || hasVideoAttr) && !msgData.has_video) {
              videoCount++;
              msgData.has_video = true;
              
              let duration = 0, width = 0, height = 0;
              if (doc.attributes) {
                for (const attr of doc.attributes) {
                  if (attr.className === 'DocumentAttributeVideo') {
                    duration = attr.duration || 0;
                    width = attr.w || 0;
                    height = attr.h || 0;
                  }
                }
              }
              
              msgData.video = {
                file_id: doc.id ? doc.id.toString() : null,
                access_hash: doc.accessHash ? doc.accessHash.toString() : null,
                file_reference: doc.fileReference ? Buffer.from(doc.fileReference).toString('base64') : null,
                duration: duration,
                width: width,
                height: height,
                size: doc.size ? Number(doc.size) : 0,
                mime_type: doc.mimeType,
              };
              console.log(`  [VIDEO-MEDIA] Msg #${msg.id}: ${(msgData.video.size / 1024 / 1024).toFixed(1)}MB, ${duration}s, ${width}x${height}, ${doc.mimeType}`);
              if (msgData.text) console.log(`    Caption: ${msgData.text.substring(0, 120)}`);
            } else if (!isVideo && !hasVideoAttr && !msgData.has_document) {
              // It's a regular document/file
              docCount++;
              msgData.has_document = true;
              let fileName = null;
              if (doc.attributes) {
                for (const attr of doc.attributes) {
                  if (attr.fileName) fileName = attr.fileName;
                }
              }
              msgData.document = {
                file_id: doc.id ? doc.id.toString() : null,
                access_hash: doc.accessHash ? doc.accessHash.toString() : null,
                file_name: fileName,
                mime_type: doc.mimeType,
                size: doc.size ? Number(doc.size) : 0,
              };
              console.log(`  [DOC-MEDIA] Msg #${msg.id}: ${fileName || 'unnamed'} (${doc.mimeType}, ${(msgData.document.size / 1024).toFixed(0)}KB)`);
            }
          }

          // Photo in media wrapper
          if (media.className === 'MessageMediaPhoto' && media.photo) {
            photoCount++;
            msgData.has_photo = true;
            const photo = media.photo;
            msgData.photo = {
              file_id: photo.id ? photo.id.toString() : null,
              access_hash: photo.accessHash ? photo.accessHash.toString() : null,
              date: photo.date,
            };
            console.log(`  [PHOTO] Msg #${msg.id}: Photo ID ${photo.id}`);
          }
        }

        // Text-only messages
        if (!msgData.has_video && !msgData.has_document && !msgData.has_photo && msgData.text) {
          textCount++;
          if (msgData.text.length > 20) {
            console.log(`  [TEXT] Msg #${msg.id}: ${msgData.text.substring(0, 100)}`);
          }
        }

        allContent[channel.category].messages.push(msgData);
      }

      console.log(`\n  Summary for ${channel.name}:`);
      console.log(`    Videos: ${videoCount}, Documents: ${docCount}, Photos: ${photoCount}, Text: ${textCount}`);

    } catch (err) {
      console.error(`  ERROR scanning ${channel.name}:`, err.message);
    }
  }

  // Write results to JSON
  const outputPath = path.join(__dirname, 'telegram_channel_content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2));
  console.log(`\n✓ Full content map saved to: ${outputPath}`);

  await client.disconnect();
  console.log('✓ Disconnected from Telegram MTProto');
}

main().catch(function(err) {
  console.error('Fatal error:', err);
  process.exit(1);
});
