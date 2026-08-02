---
title: Edustream
emoji: 🎓
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
license: other
app_port: 7860
---

# EduStream — Telethon MTProto Video Stream & AI Backend

FastAPI backend that streams videos from private Telegram educational channels using Telethon with Bot Token authentication.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check & bot connection status |
| `/stream/{chat_id}/{msg_id}` | GET | Stream video bytes with HTTP 206 range support |
| `/api/download/{chat_id}/{msg_id}` | GET | Download attachments (PDFs, ZIPs, etc.) |
| `/api/catalog/{chat_id}` | GET | List videos from a single channel |
| `/api/catalog/all` | GET | List videos from all 4 configured channels |
| `/api/compile` | POST | Code execution via OnlineCompiler.io |
| `/api/ai/code-review` | POST | Mistral AI code review |
| `/api/ai/diagnostic` | POST | Student performance diagnostics |

## Required Secrets (set in HF Space Settings)

- `TELEGRAM_BOT_TOKEN` — Bot token from @BotFather
- `TELEGRAM_API_ID` — Telegram API ID
- `TELEGRAM_API_HASH` — Telegram API Hash
- `TELEGRAM_CHANNEL_DSA` — DSA channel ID
- `TELEGRAM_CHANNEL_SYSTEM_DESIGN` — System Design channel ID
- `TELEGRAM_CHANNEL_DBMS` — DBMS channel ID
- `TELEGRAM_CHANNEL_CN` — Computer Networks channel ID
- `GROQ_API_KEY` — Groq Whisper STT key
- `MISTRAL_API_KEY` — Mistral AI key
- `ONLINE_COMPILER_API_KEY` — OnlineCompiler.io key
