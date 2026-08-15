# utron-ai

ULTRON — a multi-module AI assistant (Chat, Code, Create, Research, Business Manager) powered by OpenRouter, deployed as a static frontend + Vercel serverless functions.

## Voice (Speak & Listen)

ULTRON can now talk and listen, using two free OpenRouter models:

- **Speaking (Text-to-Speech):** `deepgram/flux-tts:free` via `api/tts.js`, which calls OpenRouter's `/api/v1/audio/speech` endpoint. Click the 🔊 icon on any ULTRON reply to hear it, or turn on **AUTO VOICE** (top-right of the header) to have every reply spoken automatically.
- **Listening (Speech-to-Text):** `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` via `api/stt.js`, which sends your recorded voice to OpenRouter's `/api/v1/chat/completions` endpoint using the `input_audio` content type. Click the 🎤 icon next to any Send button, speak, click it again to stop — your words are transcribed and sent automatically.

### Setup

1. In your Vercel project → **Settings → Environment Variables**, set:
   - `OPENROUTER_API_KEY` — your OpenRouter API key (already required for chat/research/business too)
   - `SITE_URL` (optional) — your deployed URL, used for OpenRouter's `HTTP-Referer` header
2. Microphone access requires **HTTPS** (or `localhost`) — Vercel deployments are HTTPS by default, so this works out of the box in production.
3. If Flux TTS rejects the `voice` value (voice IDs can change), open `api/tts.js` and adjust the `voice` field to match a voice listed on the model's OpenRouter page: https://openrouter.ai/deepgram/flux-tts:free

### API routes

| Route | Purpose | Model |
|---|---|---|
| `api/chat.js` | General chat/code/create replies | `anthropic/claude-sonnet-4-5` |
| `api/research.js` | Deep research reports | `anthropic/claude-sonnet-4-5` |
| `api/business.js` | Business intelligence advice | `anthropic/claude-sonnet-4-5` |
| `api/tts.js` | Text → speech (AI voice replies) | `deepgram/flux-tts:free` |
| `api/stt.js` | Speech → text (voice input) | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` |
