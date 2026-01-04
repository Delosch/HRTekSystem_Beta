# Backup current .env
Copy-Item .env .env.backup -ErrorAction SilentlyContinue

# Copy new configuration to .env
Copy-Item .env.new-tables .env -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Changes made:" -ForegroundColor Yellow
Write-Host "  - Backed up old .env to .env.backup"
Write-Host "  - Copied .env.new-tables to .env"
Write-Host ""
Write-Host "📌 New DynamoDB tables configured:" -ForegroundColor Yellow
Write-Host "  - Users: hrtek-users-prod"
Write-Host "  - Companies: hrtek-companies-prod"
Write-Host "  - Assessments: hrtek-assessments-prod"
Write-Host "  - Payments: hrtek-payments-prod"
Write-Host "  - Cart: hrtek-cart-prod"
Write-Host ""
Write-Host "⚠️  IMPORTANT: You MUST restart your dev server!" -ForegroundColor Red
Write-Host ""
Write-Host "Steps to restart:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+C in the terminal running 'npm run dev'"
Write-Host "  2. Run 'npm run dev' again"
Write-Host ""
Write-Host "After restart, new users will be stored in hrtek-users-prod ✅" -ForegroundColor Green
Write-Host ""
