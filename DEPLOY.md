# Deploy Farm.co (show it to everyone)

Yes — for a **public** deploy you must set API keys as **environment variables on the hosting platform**.  
Do **not** put real keys in GitHub. Your local `server/.env` stays on your machine only.

---

## What you need (API keys)

| Variable | Required? | Used for |
|----------|-----------|----------|
| `MONGODB_URI` | **Yes** | Database (you already have Atlas) |
| `JWT_SECRET` | **Yes** | Login tokens (use a long random string) |
| `NVIDIA_API_KEY` | **Yes** (for AI Chat) | Farming chatbot |
| `OPENWEATHER_API_KEY` | Recommended | Weather page |
| `FAST2SMS_API_KEY` | Recommended | SMS reminders to phone |
| `PLANT_ID_API_KEY` | Optional | Leaf disease detection |
| `CLIENT_URL` | **Yes** in prod | Your live frontend URL (CORS) |
| `PORT` | Auto | Hosts usually set this for you |

Speech works in the **browser** (Chrome) without Google Cloud.  
Soil OCR needs `google-cloud.json` only if you want Vision OCR in production (harder on free hosts).

---

## Recommended free/cheap setup

### A) Backend → [Render](https://render.com)
### B) Frontend → [Netlify](https://www.netlify.com) or [Vercel](https://vercel.com)
### C) Database → MongoDB Atlas (already set up)

---

## Step 1 — Deploy the backend (Render)

1. Go to [Render](https://render.com) → **New → Web Service**
2. Connect GitHub repo: `Yashwanthmdj/Farm.co`
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** (same values as your local `server/.env`):

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=pick-a-long-random-secret
NVIDIA_API_KEY=nvapi-...
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
OPENWEATHER_API_KEY=...
FAST2SMS_API_KEY=...
PLANT_ID_API_KEY=...
ADMIN_KEY=any-admin-key
API_RATE_LIMIT=2000
CLIENT_URL=https://YOUR-FRONTEND.netlify.app
```

5. Deploy → copy your backend URL, e.g.  
   `https://farmco-api.onrender.com`

6. In MongoDB Atlas → **Network Access** → allow `0.0.0.0/0` (or Render’s IPs) so the cloud server can connect.

Test: open `https://YOUR-BACKEND.onrender.com/health`

---

## Step 2 — Deploy the frontend (Netlify)

1. Go to [Netlify](https://app.netlify.com) → **Add new site → Import from Git**
2. Select `Yashwanthmdj/Farm.co`
3. Settings:
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/build`
4. Add environment variable:

```env
REACT_APP_API_URL=https://YOUR-BACKEND.onrender.com
```

5. Deploy → you get a public URL like `https://farmco.netlify.app`

6. Go back to Render and set:

```env
CLIENT_URL=https://farmco.netlify.app
```

Redeploy backend once after that.

---

## Step 3 — Share with everyone

Send people:

**https://your-frontend-url.netlify.app**

They can register with phone + PIN and use the app.

---

## Important notes

1. **Free Render** spins down after idle ~15 minutes — first request can be slow (30–60s). Upgrade or use Railway if you need it always warm.
2. **NVIDIA / Fast2SMS / Plant.id** have usage quotas — monitor dashboards so keys don’t run out during a demo.
3. Rotate any key you pasted in chat earlier (especially NVIDIA).
4. Keep `server/.env` local; only paste keys into the host’s Environment panel.

---

## Quick local check before deploying

```bash
# Backend
cd server && npm start

# Frontend (point at local API)
# client/.env → REACT_APP_API_URL=http://localhost:5001
cd client && npm start
```

When both work locally with your keys, the same keys go into Render/Netlify.
