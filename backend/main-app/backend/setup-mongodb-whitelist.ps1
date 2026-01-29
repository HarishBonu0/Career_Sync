# MongoDB Atlas IP Whitelist Setup Script
# This script will guide you through adding your IP to MongoDB Atlas

Write-Host "`n🔐 MongoDB Atlas IP Whitelist Setup" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Check if node is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Get current IP
Write-Host "🌐 Detecting your current IP address...`n" -ForegroundColor Yellow
node check-ip.js

Write-Host "`n" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ACTION REQUIRED: Whitelist Your IP" -ForegroundColor Green  
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📋 Follow these steps:`n" -ForegroundColor White

Write-Host "1. Open your browser and go to:" -ForegroundColor White
Write-Host "   https://cloud.mongodb.com`n" -ForegroundColor Cyan

Write-Host "2. Sign in to your MongoDB Atlas account`n" -ForegroundColor White

Write-Host "3. Select your project and cluster`n" -ForegroundColor White

Write-Host "4. Click 'Network Access' in the left sidebar`n" -ForegroundColor White

Write-Host "5. Click 'Add IP Address' button`n" -ForegroundColor White

Write-Host "6. Choose one of these options:`n" -ForegroundColor White

Write-Host "   Option A (Recommended for Development):" -ForegroundColor Yellow
Write-Host "   - Click 'Add Current IP Address'" -ForegroundColor White
Write-Host "   - Or manually enter: 157.50.153.2" -ForegroundColor Cyan
Write-Host "   - Add comment: 'Development Machine'" -ForegroundColor White
Write-Host "   - Click 'Confirm'`n" -ForegroundColor White

Write-Host "   Option B (Quick Testing - Not Secure):" -ForegroundColor Yellow
Write-Host "   - Click 'Allow Access from Anywhere'" -ForegroundColor White
Write-Host "   - This adds: 0.0.0.0/0" -ForegroundColor Cyan
Write-Host "   - Click 'Confirm'`n" -ForegroundColor White

Write-Host "7. Wait 1-2 minutes for the changes to apply`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Green

$response = Read-Host "Have you completed the IP whitelisting? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`n🧪 Testing MongoDB connection...`n" -ForegroundColor Yellow
    
    # Test connection
    node test-mongodb.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  ✅ SUCCESS! MongoDB is Connected!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "🚀 Next Steps:`n" -ForegroundColor Cyan
        Write-Host "1. Start your backend server:" -ForegroundColor White
        Write-Host "   cd d:\downloads\hello\backend\main-app\backend" -ForegroundColor Cyan
        Write-Host "   npm start`n" -ForegroundColor Cyan
        
        Write-Host "2. Or start all services:" -ForegroundColor White
        Write-Host "   cd d:\downloads\hello" -ForegroundColor Cyan
        Write-Host "   .\start-all.ps1`n" -ForegroundColor Cyan
        
        Write-Host "3. Test authentication:" -ForegroundColor White
        Write-Host "   http://localhost:4173/auth.html`n" -ForegroundColor Cyan
        
    } else {
        Write-Host "`n========================================" -ForegroundColor Red
        Write-Host "  ⚠️ Connection Still Failing" -ForegroundColor Red
        Write-Host "========================================`n" -ForegroundColor Red
        
        Write-Host "💡 Troubleshooting:`n" -ForegroundColor Yellow
        Write-Host "1. Wait 1-2 more minutes for IP whitelist to activate" -ForegroundColor White
        Write-Host "2. Verify you added the correct IP: 157.50.153.2" -ForegroundColor White
        Write-Host "3. Check if cluster is running (not paused)" -ForegroundColor White
        Write-Host "4. Verify credentials in Database Access:" -ForegroundColor White
        Write-Host "   User: harishbonu3_db_user" -ForegroundColor Cyan
        Write-Host "   Password: CareerOS@HaRISH`n" -ForegroundColor Cyan
        
        Write-Host "5. Try testing again:" -ForegroundColor White
        Write-Host "   node test-mongodb.js`n" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n⏸️  Setup paused. Run this script again after whitelisting your IP.`n" -ForegroundColor Yellow
    Write-Host "Quick command:" -ForegroundColor White
    Write-Host "   .\setup-mongodb-whitelist.ps1`n" -ForegroundColor Cyan
}

Write-Host "📚 For detailed help, see: MONGODB_SETUP_GUIDE.md`n" -ForegroundColor White
