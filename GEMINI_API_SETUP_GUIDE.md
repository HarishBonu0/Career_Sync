# 🔐 Google Gemini API Setup - Complete Guide

## **Step 1: Create/Access Google Cloud Project**

1. Go to: **https://console.cloud.google.com/**
2. Click on the **Project Selector** (top-left, dropdown next to "Google Cloud")
3. Click **NEW PROJECT**
   - Project name: `CareerSync` (or anything)
   - Organization: Leave default
   - Click **CREATE**
4. Wait 30 seconds for project to be created
5. Select the new project from the dropdown

---

## **Step 2: Enable Generative Language API**

1. In the Google Cloud Console, go to **APIs & Services** → **Enabled APIs & Services** (left sidebar)
2. Click **+ ENABLE APIS AND SERVICES** (top button)
3. Search for: **`Generative Language API`**
4. Click on the result
5. Click **ENABLE** (blue button)
6. Wait for enablement to complete (30 seconds)
7. ✅ You should see "API is enabled" confirmation

---

## **Step 3: Create an API Key**

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** (top button)
3. Select **API Key** from dropdown
4. A popup shows your new API key
5. 📋 **Copy and save this key** - you need it!
6. Click elsewhere to close the popup

---

## **Step 4: Restrict API Key (IMPORTANT)**

⚠️ **Do NOT skip this step** - it prevents quota from being wasted on other APIs

1. In the Credentials page, find your key in the list
2. Click on the key name to edit it
3. Under **Application restrictions**:
   - Select: **None** (for development)
   - Or select: **Allowed application types** → Configure as needed
4. Under **API restrictions** (CRITICAL):
   - Select: **Restrict key** (if not already selected)
   - Click **Select APIs**
   - Search and select: **Generative Language API**
   - ✅ Save
5. Scroll down and click **SAVE**

---

## **Step 5: Enable Billing (FREE TIER)**

⚠️ **Required even for free tier** - quota won't work without billing enabled

1. Go to **Billing** (left sidebar)
2. Click **ENABLE BILLING**
3. Choose or create a billing account
4. Add payment method (credit/debit card)
   - Google gives $300 free credits for first 3 months
   - You can set a spending limit to $0 if you're worried
5. Complete setup
6. Link billing to your project:
   - Go back to project settings
   - Link the billing account
   - ✅ Billing is now active

---

## **Step 6: Verify Quota Settings**

1. Go to **APIs & Services** → **Quotas** (left sidebar)
2. Search/filter for: **Generative Language API**
3. You should see three quotas:
   - ✅ `generate_content_free_tier_requests_per_day` → Should show available
   - ✅ `generate_content_free_tier_requests_per_minute` → Should show available
   - ✅ `generate_content_free_tier_input_token_count_per_minute` → Should show available
4. If all show "Unlimited" or have available quota → ✅ You're ready!

---

## **Step 7: Update Your .env File**

1. Open: `backend/main-app/backend/.env`
2. Find line with: `GEMINI_API_KEY=AIzaSyB...`
3. Replace with your new API key:
   ```
   GEMINI_API_KEY=<YOUR_NEW_API_KEY_HERE>
   ```
4. Save the file

---

## **Step 8: Restart Backend**

```powershell
cd "c:\Users\vamsi\Desktop\Career OS\backend\main-app\backend"
npm start
```

---

## **Step 9: Test**

Make a test request:

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/skills/evaluate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"skillName":"JavaScript","difficulty":"beginner","questionCount":5}' `
  -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
Write-Host "Source: $($json.source)" -ForegroundColor Green
```

Expected output: `Source: Gemini AI (Live)` (Not "Mock Data")

---

## **Quota Limits (Free Tier)**

| Metric | Free Tier Limit |
|--------|-----------------|
| Requests per minute | 15 |
| Requests per day | 100 |
| Input tokens per minute | 32,500 |
| Output tokens per minute | 32,500 |

---

## **Troubleshooting**

### **Still showing "Mock Data (API Fallback)"?**
1. Check `.env` file is updated with new key
2. Restart backend: `npm start`
3. Test again

### **API Key shows as "expired"?**
- Key wasn't enabled properly in Google Cloud
- Go back to Step 2 and ensure Generative Language API is **ENABLED**

### **Still getting 429 errors?**
- Quota exhausted on free tier
- Add a credit card for billing (step 5)
- Or create fresh project and repeat steps

### **Multiple projects by accident?**
- Go to Google Cloud Console
- Project Selector (top-left) → View all projects
- Delete the unwanted ones

---

## **⚠️ Important Notes**

1. **One API key per project** - If you test with multiple keys, they share the same quota!
2. **Billing address required** - Even with $0 spending limit
3. **Quota resets daily** - 100 requests per day free tier
4. **With optimized backend** - Each test uses only 1 API call (not 6!)
5. **Mock data fallback** - System still works if quota is hit, but with pre-written questions

---

## **Next Steps**

✅ Create new project  
✅ Enable Generative Language API  
✅ Create API key with restrictions  
✅ Enable billing  
✅ Update `.env` file  
✅ Restart backend  
✅ Test with live AI  

Good to go! 🚀
