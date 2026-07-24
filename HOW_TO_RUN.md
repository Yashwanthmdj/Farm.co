# How to Run Farm.co

## Requirements

- **Node.js 18+** (recommended: 20 or 24). Node 14 will not work well.
- MongoDB Atlas connection (already configured in `server/.env`)
- Optional: [Ollama](https://ollama.com) for AI chat
- Optional: `ffmpeg` for speech-to-text
- Optional: `server/google-cloud.json` for OCR + Google Speech

## Quick start

### 1. Use a modern Node

```bash
# If you use fnm:
fnm use 24

# Or ensure /usr/local/bin is first on PATH:
export PATH="/usr/local/bin:$PATH"
node -v   # should print v18+ / v20+ / v24+
```

### 2. Install dependencies

```bash
cd /Users/maddojuyashwanth/Downloads/Farm.co-master

cd server && npm install
cd ../client && npm install
```

### 3. Backend env

`server/.env` should include at least:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=any-long-random-string
OPENWEATHER_API_KEY=your_key
PLANT_ID_API_KEY=your_key
FAST2SMS_API_KEY=your_key
OLLAMA_MODEL=llama3
PORT=5000
```

### 4. Start backend (Terminal 1)

**Important on macOS:** Port 5000 is often taken by AirPlay Receiver.  
If `npm start` fails with `EADDRINUSE`, either:

- System Settings → General → AirDrop & Handoff → turn off **AirPlay Receiver**, or
- Run on another port:

```bash
cd server
PORT=5001 npm start
```

Then set `REACT_APP_API_URL=http://localhost:5001` in `client/.env`.

Default (this project uses **5001** because macOS AirPlay often blocks 5000):

```bash
cd server
npm start
```

Health check: http://localhost:5001/health

### 5. Start frontend (Terminal 2)

```bash
cd client
npm start
```

Open: http://localhost:3000

### 6. Optional — AI chat (Ollama)

```bash
ollama serve
ollama pull llama3
```

Without Ollama, chat will show a clear error; other modules still work.

---

## App routes

| URL | Page |
|-----|------|
| `/` | Landing |
| `/login` | Login / Register (phone + 6-digit PIN) |
| `/app/dashboard` | Dashboard |
| `/app/chat` | AI Chat |
| `/app/expenses` | Expenses |
| `/app/tractor` | Tractor logs |
| `/app/reminders` | Reminders |
| `/app/weather` | Weather |
| `/app/soil` | Soil analysis |
| `/app/disease` | Crop disease detection |
| `/app/marketplace` | Farmer marketplace |
| `/app/store` | Shop / cart / My Farm Store |
| `/app/prices` | Crop prices |
| `/app/schemes` | Government schemes |
| `/app/irrigation` | Irrigation advisor |
| `/app/analytics` | Analytics |
| `/app/profile` | Profile |
| `/app/settings` | Settings (theme, language) |

---

## First login

1. Open http://localhost:3000
2. Click **Get started** / go to `/login`
3. Enter a 10-digit phone + 6-digit PIN
4. Choose role: **farmer** or **customer**
5. Continue into the dashboard

---

## Optional Google Cloud (OCR + Speech)

1. Enable Vision API + Speech-to-Text in Google Cloud
2. Download a service-account JSON key
3. Save it as `server/google-cloud.json`
4. Install ffmpeg: `brew install ffmpeg`

Without these, soil OCR and speech return a friendly 503 — the rest of the app still runs.

---

## Production build (frontend)

```bash
cd client
npm run build
# serve the build/ folder with any static host
```
