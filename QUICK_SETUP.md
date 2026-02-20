# ⚡ Quick Setup Checklist - Google Gemini API

## **Current Status** ❌
- Your API key: `AIzaSyBSgNSgEROToOSKUMYreRcCmZF8_WmRsoE`
- Quota: **EXHAUSTED** (0 remaining)
- Action: **Create new API key**

---

## **5-Minute Setup**

### **Go To:** https://console.cloud.google.com/

```
☐ CREATE NEW PROJECT
   └─ Name: "CareerSync"
   └─ Click CREATE

☐ ENABLE APIs & Services
   └─ Search: "Generative Language API"
   └─ Click ENABLE

☐ CREATE API KEY
   └─ APIs & Services → Credentials
   └─ + CREATE CREDENTIALS → API Key
   └─ 📋 COPY THE KEY

☐ RESTRICT KEY (Important!)
   └─ Click on key name
   └─ API restrictions → Select "Generative Language API"
   └─ SAVE

☐ ENABLE BILLING
   └─ Billing (left sidebar)
   └─ Link billing account
   └─ Add credit/debit card
   └─ Set budgets if desired
```

---

## **After Setup**

```powershell
# 1. Update .env file
cd c:\Users\vamsi\Desktop\Career

OS\backend\main-app\backend\.env

# Replace this line:
# GEMINI_API_KEY=AIzaSyBSgNSgEROToOSKUMYreRcCmZF8_WmRsoE

# With:
# GEMINI_API_KEY=<YOUR_NEW_KEY>

# 2. Restart backend
npm start

# 3. Test
Invoke-WebRequest -Uri "http://localhost:5000/api/skills/evaluate" `
  -Method POST -ContentType "application/json" `
  -Body '{"skillName":"JavaScript","difficulty":"beginner","questionCount":5}' `
  -UseBasicParsing | % {$_.Content | ConvertFrom-Json} | % {Write-Host "Source: $($_.source)"}
```

---

## **Free Tier Limits**
- 15 requests/minute
- 100 requests/day
- With your optimized backend = 1 API call per test = **100 tests/day**

---

## **Common Issues**

| Issue | Solution |
|-------|----------|
| Still shows "Mock Data" | Restart backend after updating .env |
| "429 Too Many Requests" | Check if billing is enabled, or quota hit |
| "API key expired" | Ensure Generative Language API is ENABLED in Google Cloud |
| "Invalid API key" | Double-check key copied correctly (no spaces) |

---

📖 **Full Guide:** See `GEMINI_API_SETUP_GUIDE.md` in project root
