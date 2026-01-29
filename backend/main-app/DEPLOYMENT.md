# SkillRoute AI - Deployment Guide

## 🚀 Production Deployment

This guide covers deploying SkillRoute AI to production.

## ☁️ Option 1: Render (Recommended - Free tier available)

### Backend Deployment

1. **Push to GitHub**
   ```bash
   cd app
   git init
   git add .
   git commit -m "SkillRoute AI - Initial deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub
   - Dashboard → Create New → Web Service

3. **Configure Backend Service**
   - **Name**: skillroute-backend
   - **Branch**: main
   - **Build Command**: `cd app/backend && npm install`
   - **Start Command**: `cd app/backend && npm start`
   - **Instance Type**: Free (or Paid)
   - **Environment Variables**:
     ```
     PORT=5000
     NODE_ENV=production
     GEMINI_API_KEY=your_key
     SUPABASE_URL=your_url
     SUPABASE_ANON_KEY=your_key
     JWT_SECRET=generate_strong_random_string
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 min)
   - Copy your backend URL (e.g., `https://skillroute-backend.onrender.com`)

### Frontend Deployment (Vercel)

1. **Sign up on Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Import project

2. **Configure Frontend**
   - **Framework Preset**: Vite
   - **Root Directory**: `app/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   - **VITE_API_URL**: `https://skillroute-backend.onrender.com`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Your site is live!

## 🐳 Option 2: Docker + Render

1. **Build Docker Image**
   ```bash
   docker build -t skillroute-ai .
   docker run -p 5000:5000 skillroute-ai
   ```

2. **Deploy with Docker**
   - Render → Create Web Service
   - Connect GitHub repo
   - **Build Command**: `docker build -t skillroute .`
   - **Start Command**: `docker run -p 5000:5000 skillroute`

## 🌐 Option 3: Self-Hosted (VPS)

### Ubuntu/Debian VPS Setup

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2** (process manager)
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone Repository**
   ```bash
   git clone your_repo.git
   cd app
   npm run install:all
   ```

4. **Setup Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your keys
   ```

5. **Start Application**
   ```bash
   pm2 start "npm start" --name skillroute-backend
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   ```
   
   Create `/etc/nginx/sites-available/skillroute`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/skillroute /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Enable HTTPS (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔐 Production Security Checklist

- [ ] JWT_SECRET changed to strong random value
- [ ] NODE_ENV=production
- [ ] HTTPS enabled
- [ ] CORS origins restricted to your domain
- [ ] Supabase RLS policies enabled
- [ ] Environment variables not in code
- [ ] API keys from production services
- [ ] Database backups configured
- [ ] Monitoring/alerts setup
- [ ] Rate limiting enabled

## 📊 Environment Variables (Production)

```env
# Server
PORT=5000
NODE_ENV=production

# API Keys
GEMINI_API_KEY=pk-xxx (from Google)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyxxx

# Security
JWT_SECRET=generate_strong_string_here

# Optional
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=error
```

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy SkillRoute AI

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_DEPLOY_KEY }}
```

## 📈 Monitoring

### Setup Error Tracking (Sentry - Free)

1. Create Sentry account: https://sentry.io
2. Install Sentry SDK:
   ```bash
   npm install @sentry/node
   ```
3. Add to backend/server.js:
   ```javascript
   import * as Sentry from "@sentry/node";
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

## 🔧 Scaling (When You Grow)

### Database Optimization
- Enable connection pooling in Supabase
- Add database indexes
- Monitor query performance

### Backend Scaling
- Increase Render instance size
- Setup load balancer
- Implement caching (Redis)

### Frontend Optimization
- Serve from CDN (Vercel/Netlify already does this)
- Enable gzip compression
- Optimize images
- Lazy load modules

## 🛠️ Common Issues

**CORS errors in production:**
- Update CORS origin in backend/server.js
- Add your domain to CORS allowlist

**API not responding:**
- Check Render service logs
- Verify environment variables set
- Check database connection

**Database full:**
- Upgrade Supabase plan
- Archive old data
- Enable automatic backups

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.io/docs
- Express.js: https://expressjs.com

---

**Deployment complete! Your site is now live! 🎉**
