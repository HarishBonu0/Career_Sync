# 🚀 Deployment Guide - Knowledge Assessment Platform

## Security Fixes Implemented ✅

### 1. **API Key Security** 
- ❌ **Before**: Gemini API key was exposed in frontend code
- ✅ **After**: API key is securely stored in backend `.env` file only
- The frontend **never** sees or transmits the API key

### 2. **Professional Styling**
- Uses the purple gradient color scheme: `#667eea` to `#764ba2`
- Responsive design for all screen sizes
- Modern UI with smooth animations and transitions

---

## 📋 Pre-Deployment Checklist

### Backend Setup

1. **Environment Variables** (backend/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/knowledge-assessment
GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=production
```

2. **Install Dependencies**
```bash
cd backend
npm install
```

### Frontend Setup

1. **Environment Variables** (.env.production)
```env
REACT_APP_API_URL=/api
```

2. **Install Dependencies**
```bash
npm install
```

---

## 🌐 Deployment Options

### Option 1: Deploy to Vercel (Frontend) + MongoDB Atlas + Heroku/Railway (Backend)

#### Backend (Heroku/Railway):

1. **Create account** on Heroku or Railway
2. **Connect GitHub repository**
3. **Set environment variables**:
   - `MONGODB_URI` (from MongoDB Atlas)
   - `GEMINI_API_KEY` (from Google AI Studio)
   - `PORT` (usually auto-set)
   - `NODE_ENV=production`

4. **Deploy command**:
```json
// In backend/package.json, ensure you have:
{
  "scripts": {
    "start": "node server.js"
  }
}
```

#### Frontend (Vercel):

1. **Create account** on Vercel
2. **Import GitHub repository**
3. **Set environment variables**:
   - `REACT_APP_API_URL=https://your-backend.herokuapp.com/api`

4. **Build settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

---

### Option 2: Deploy to Single VPS (DigitalOcean/AWS/Linode)

1. **Setup MongoDB**
```bash
# Install MongoDB
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

2. **Setup Backend**
```bash
cd backend
npm install --production
npm install -g pm2

# Create .env file with production values
nano .env

# Start with PM2
pm2 start server.js --name "knowledge-backend"
pm2 startup
pm2 save
```

3. **Setup Frontend**
```bash
# Build React app
npm run build

# Install nginx
sudo apt install nginx

# Configure nginx to serve React build
sudo nano /etc/nginx/sites-available/knowledge-app
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React frontend
    location / {
        root /path/to/your/project/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable site and restart nginx**
```bash
sudo ln -s /etc/nginx/sites-available/knowledge-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 3: Deploy to Netlify (Frontend) + Render (Backend)

#### Backend (Render):

1. **Create account** on Render.com
2. **New Web Service** → Connect GitHub
3. **Settings**:
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/server.js`
4. **Environment Variables**:
   - Add `MONGODB_URI`, `GEMINI_API_KEY`, etc.

#### Frontend (Netlify):

1. **Create account** on Netlify
2. **New Site from Git** → Connect repository
3. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `build`
4. **Environment Variables**:
   - `REACT_APP_API_URL=https://your-backend.onrender.com/api`

5. **Add `_redirects` file** in public folder:
```
/api/*  https://your-backend.onrender.com/api/:splat  200
/*  /index.html  200
```

---

## 🔒 Security Best Practices

### 1. Never Commit Sensitive Data
```bash
# Ensure .env files are in .gitignore
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore
```

### 2. Use Environment Variables for All Secrets
- API Keys
- Database URLs
- JWT Secrets
- Third-party credentials

### 3. Enable CORS Properly
```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 4. Add Rate Limiting
```bash
cd backend
npm install express-rate-limit
```

```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🧪 Testing Before Deployment

### Local Production Build Test

1. **Build frontend**:
```bash
npm run build
npm install -g serve
serve -s build
```

2. **Test backend**:
```bash
cd backend
NODE_ENV=production node server.js
```

3. **Verify**:
- Frontend connects to backend
- No API key visible in browser Network tab
- All features work correctly

---

## 📊 Monitoring

### Backend Monitoring
- Use PM2 for process management
- Set up error logging
- Monitor API response times

### Frontend Monitoring
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring

---

## 🔄 Continuous Deployment

### GitHub Actions Example (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

---

## 🎉 Post-Deployment

1. **Test all features** in production
2. **Monitor logs** for errors
3. **Set up database backups**
4. **Configure SSL certificate** (Let's Encrypt)
5. **Set up custom domain** (optional)

---

## 📝 Important Notes

- **MongoDB Atlas**: Use for production database (free tier available)
- **API Key Security**: The Gemini API key is NEVER exposed to clients
- **Environment Variables**: Set them in your hosting platform's dashboard
- **CORS**: Update allowed origins for production URLs
- **Rate Limiting**: Protect your API from abuse

---

## 🆘 Troubleshooting

### "API Key not configured" error
- Ensure `GEMINI_API_KEY` is set in backend environment variables
- Restart the backend server after adding environment variables

### CORS errors
- Update CORS settings in backend/server.js with your production frontend URL
- Ensure environment variables are properly set

### Database connection errors
- Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0 for testing)
- Verify MONGODB_URI format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ API key is not visible in browser Network/Sources tabs
- ✅ Frontend loads without errors
- ✅ Questions generate correctly
- ✅ Test submission works
- ✅ Results page displays properly
- ✅ Purple gradient colors are consistent throughout
- ✅ Mobile responsive design works

---

**Need Help?** Check platform-specific documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
