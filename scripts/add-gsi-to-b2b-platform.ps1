# Add Global Secondary Indexes to b2b_platform Table
# Simpler version using JSON files

Write-Host "Adding Global Secondary Indexes to b2b_platform table..." -ForegroundColor Cyan
Write-Host ""

$region = if ($env:AWS_REGION) { $env:AWS_REGION } else { "ap-south-1" }
$tableName = "b2b_platform"

Write-Host "Using AWS Region: $region" -ForegroundColor Green
Write-Host "Table Name: $tableName" -ForegroundColor Green
Write-Host ""

# Check if table exists
Write-Host "Checking if table exists..." -ForegroundColor Cyan
aws dynamodb describe-table --table-name $tableName --region $region 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Table '$tableName' does not exist!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Table exists" -ForegroundColor Green
Write-Host ""

# Create temporary JSON files for GSI definitions
$emailIndexJson = @"
[
  {
    "Create": {
      "IndexName": "email-index",
      "KeySchema": [
        {
          "AttributeName": "email",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    }
  }
]
"@

$phoneIndexJson = @"
[
  {
    "Create": {
      "IndexName": "phone-index",
      "KeySchema": [
        {
          "AttributeName": "phone",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    }
  }
]
"@

# Save JSON to temp files
$emailIndexFile = "$env:TEMP\email-index.json"
$phoneIndexFile = "$env:TEMP\phone-index.json"

$emailIndexJson | Out-File -FilePath $emailIndexFile -Encoding UTF8
$phoneIndexJson | Out-File -FilePath $phoneIndexFile -Encoding UTF8

# Add email-index
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Adding email-index GSI..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

aws dynamodb update-table `
    --table-name $tableName `
    --attribute-definitions AttributeName=email, AttributeType=S `
    --global-secondary-index-updates file://$emailIndexFile `
    --region $region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ email-index creation initiated" -ForegroundColor Green
}
else {
    Write-Host "⚠ email-index may already exist or table is being updated" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Waiting 30 seconds before adding phone-index..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Add phone-index
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Adding phone-index GSI..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

aws dynamodb update-table `
    --table-name $tableName `
    --attribute-definitions AttributeName=phone, AttributeType=S `
    --global-secondary-index-updates file://$phoneIndexFile `
    --region $region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ phone-index creation initiated" -ForegroundColor Green
}
else {
    Write-Host "⚠ phone-index may already exist or table is being updated" -ForegroundColor Yellow
}

# Cleanup temp files
Remove-Item $emailIndexFile -ErrorAction SilentlyContinue
Remove-Item $phoneIndexFile -ErrorAction SilentlyContinue

# Monitor status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Monitoring index creation status..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 20
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Check $attempt/$maxAttempts..." -ForegroundColor Cyan
    
    Start-Sleep -Seconds 30
    
    $tableJson = aws dynamodb describe-table --table-name $tableName --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        $table = $tableJson | ConvertFrom-Json
        
        $emailIdx = $table.Table.GlobalSecondaryIndexes | Where-Object { $_.IndexName -eq "email-index" }
        $phoneIdx = $table.Table.GlobalSecondaryIndexes | Where-Object { $_.IndexName -eq "phone-index" }
        
        $emailStatus = if ($emailIdx) { $emailIdx.IndexStatus } else { "NOT FOUND" }
        $phoneStatus = if ($phoneIdx) { $phoneIdx.IndexStatus } else { "NOT FOUND" }
        
        Write-Host "  email-index: $emailStatus" -ForegroundColor $(if ($emailStatus -eq "ACTIVE") { "Green" } else { "Yellow" })
        Write-Host "  phone-index: $phoneStatus" -ForegroundColor $(if ($phoneStatus -eq "ACTIVE") { "Green" } else { "Yellow" })
        
        if ($emailStatus -eq "ACTIVE" -and $phoneStatus -eq "ACTIVE") {
            Write-Host ""
            Write-Host "✓ All indexes are ACTIVE!" -ForegroundColor Green
            break
        }
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server" -ForegroundColor White
Write-Host "2. Test user login" -ForegroundColor White
Write-Host "3. Test payment submission" -ForegroundColor White
Write-Host ""
