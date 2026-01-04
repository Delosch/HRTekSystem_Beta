# Create Sessions Table for HRTek
# This script creates the DynamoDB sessions table required for user session management

Write-Host "Creating Sessions DynamoDB Table..." -ForegroundColor Cyan
Write-Host ""

# Get AWS region from environment variable or use default
$region = $env:AWS_REGION
if (-not $region) {
    $region = "us-east-1"
    Write-Host "AWS_REGION not set, using default: $region" -ForegroundColor Yellow
}
else {
    Write-Host "Using AWS Region: $region" -ForegroundColor Green
}
Write-Host ""

# Create the sessions table
Write-Host "Creating 'sessions' table..." -ForegroundColor Yellow
try {
    aws dynamodb create-table `
        --table-name sessions `
        --attribute-definitions "AttributeName=sessionId,AttributeType=S" `
        --key-schema "AttributeName=sessionId,KeyType=HASH" `
        --billing-mode PAY_PER_REQUEST `
        --region $region

    Write-Host "✓ Table creation initiated" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creating table: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Waiting for table to be created..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Enable TTL on the expiresAt attribute for automatic session cleanup
Write-Host ""
Write-Host "Enabling TTL (Time To Live) on expiresAt attribute..." -ForegroundColor Yellow
try {
    aws dynamodb update-time-to-live `
        --table-name sessions `
        --time-to-live-specification "Enabled=true,AttributeName=expiresAt" `
        --region $region

    Write-Host "✓ TTL enabled successfully" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error enabling TTL: $_" -ForegroundColor Red
    Write-Host "You may need to enable TTL manually in the AWS Console" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Verifying table creation..." -ForegroundColor Cyan
try {
    $tableInfo = aws dynamodb describe-table --table-name sessions --region $region | ConvertFrom-Json
    Write-Host "✓ Table Status: $($tableInfo.Table.TableStatus)" -ForegroundColor Green
    Write-Host "✓ Partition Key: $($tableInfo.Table.KeySchema[0].AttributeName)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error verifying table: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Listing all DynamoDB tables:" -ForegroundColor Cyan
aws dynamodb list-tables --region $region

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "SUCCESS! Sessions table created successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server (npm run dev)" -ForegroundColor White
Write-Host "2. Test login at /auth" -ForegroundColor White
Write-Host "3. Navigate to /roadmapDashboard to verify the fix" -ForegroundColor White
Write-Host ""
