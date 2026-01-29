# How to Get Your FREE Gemini API Key

## The Issue
Course generation is failing because the `GEMINI_API_KEY` is missing from your `.env` file.

## Get Your FREE API Key (Takes 2 minutes)

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**
   - Use any Google account (Gmail, etc.)

3. **Create API Key:**
   - Click "Create API Key" button
   - Select "Create API key in new project" (or select existing project)
   - Copy the generated key (starts with `AIza...`)

4. **Add to .env File:**
   - Open: `backend/main-app/backend/.env`
   - Find this line:
     ```
     GEMINI_API_KEY=
     ```
   - Paste your key:
     ```
     GEMINI_API_KEY=AIzaSyD...your_key_here
     ```
   - Save the file

5. **Restart Backend Server:**
   ```bash
   # Stop current server (Ctrl+C in terminal)
   # Then restart:
   cd "C:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app"
   npm start
   ```

## Then Test Course Generation

1. Go to: http://localhost:3002
2. Enter course details (e.g., "Python Basics" for "beginner")
3. Click "Generate Course"
4. Should work now! ✅

## Free Tier Limits
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ Perfect for development and testing

## Alternative: Use OpenRouter API

If you prefer to use your existing OpenRouter API key instead of Gemini, I can modify the code to use OpenRouter. Just let me know!
