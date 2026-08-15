import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(__dirname, '../src/lib/supabase.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace third-party implementation strings with clean educational labels
content = content.replace(/Ingested from Telegram Channel Post #\d+ \((.*?)\)\. Video stream powered by Telethon MTProto Proxy\./g, 'SDETube Curriculum Lecture: $1. High-definition cloud stream.');
content = content.replace(/\\ud83d\\udccc \[Telegram Channel Post #\d+ \| Size: (.*?)\]/g, '📌 [Lecture Module | Size: $1]');
content = content.replace(/📌 \[Telegram Channel Post #\d+ \| Size: (.*?)\]/g, '📌 [Lecture Module | Size: $1]');
content = content.replace(/Telegram Study Attachment/g, 'Lecture Study Attachment');
content = content.replace(/@Striver_DSA_Bot/g, '@SDETube_Faculty');
content = content.replace(/@Striver_CP_Bot/g, '@SDETube_Faculty');
content = content.replace(/@Striver_CS_Bot/g, '@SDETube_Faculty');
content = content.replace(/@Striver_LLD_Bot/g, '@SDETube_Faculty');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Cleaned third-party strings from supabase.ts successfully.');
