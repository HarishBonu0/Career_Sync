# 🚀 Career Sync Deployment Guide (Vercel + Render)

This project is configured for separated deployment:
- **Backend API (`apps/api`)** ➔ **Render**
- **Frontend App (`apps/web`)** ➔ **Vercel**

---

## 🛠️ Step 0: MongoDB Atlas Network Access (Critical)
Render uses dynamic server IPs. If `0.0.0.0/0` is not enabled, your deployed backend will not be able to connect to MongoDB.
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to **Security** ➔ **Network Access**
3. Click **Add IP Address** ➔ Select **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Click **Confirm**.

---

## 🌐 Step 1: Deploy Backend to Render

### Option A: Automatic via Blueprint
1. Push your latest code to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New +** ➔ **Blueprint**.
3. Connect your GitHub repository. Render will automatically read [`render.yaml`](./render.yaml).
4. Fill in the prompted secret environment variables:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `EMAILJS_*` keys (if using OTP login)
   - `RAPIDAPI_KEY` (if using live job searches)
5. Click **Apply**.

### Option B: Manual Web Service Setup
1. In [Render Dashboard](https://dashboard.render.com/), click **New +** ➔ **Web Service**.
2. Select your repository: `HarishBonu0/Career-Sync`.
3. Configure the settings:
   - **Name**: `careersync-api`
   - **Region**: Any (e.g. `Oregon (US West)` or `Frankfurt`)
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. In **Environment Variables**, add:
   | Key | Recommended Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | *(Copy your connection string from `apps/api/.env`)* |
   | `JWT_SECRET` | *(Any random 32+ character secret string)* |
   | `GEMINI_API_KEY` | *(Copy from `apps/api/.env`)* |
   | `CORS_ORIGINS` | Leave empty for now (will set after Vercel deploys) |
   | `FRONTEND_URL` | Leave empty for now (will set after Vercel deploys) |
   | `EMAILJS_SERVICE_ID` | *(Copy from `apps/api/.env`)* |
   | `EMAILJS_TEMPLATE_ID` | *(Copy from `apps/api/.env`)* |
   | `EMAILJS_PUBLIC_KEY` | *(Copy from `apps/api/.env`)* |
   | `EMAILJS_PRIVATE_KEY` | *(Copy from `apps/api/.env`)* |
   | `EMAILJS_GMAIL` | *(Copy from `apps/api/.env`)* |
   | `RAPIDAPI_KEY` | *(Copy from `apps/api/.env`)* |
5. Click **Create Web Service**.
6. When deployment finishes, copy your live backend URL (e.g., `https://careersync-api.onrender.com`).

---

## ⚡ Step 2: Deploy Frontend to Vercel

1. In [Vercel Dashboard](https://vercel.com/new), click **Add New...** ➔ **Project**.
2. Import your GitHub repository (`HarishBonu0/Career_Sync`).
3. In **Project Configuration**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose **`apps/web`**
4. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-backend-url>/api` |
   | `NEXT_PUBLIC_API_BASE_URL` | `https://<your-render-backend-url>/api` |
   | `OPENROUTER_API_KEY` | *(Copy from `apps/web/.env.local`)* |
   | `YOUTUBE_API_KEY` | *(Copy from `apps/web/.env.local`)* |
5. Click **Deploy**.
6. When deployment finishes, copy your live frontend URL (e.g., `https://careersync.vercel.app`).

---

## 🔗 Step 3: Connect Frontend URL to Backend CORS

Now that your frontend has a live domain:
1. Go back to your [Render Dashboard](https://dashboard.render.com/) ➔ select `careersync-api`.
2. Go to **Environment**.
3. Update/Add these two variables:
   - `CORS_ORIGINS`: `https://careersync.vercel.app` *(replace with your actual Vercel URL, no trailing slash)*
   - `FRONTEND_URL`: `https://careersync.vercel.app`
4. Click **Save Changes** (Render will automatically redeploy).

---

## ✅ Step 4: Verification
- Visit your Vercel URL.
- Log in or sign up.
- Upload a resume or select skills.
- Generate questions and view your interactive roadmaps.
- All requests will route securely between Vercel and Render!
