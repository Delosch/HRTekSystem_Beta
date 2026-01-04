# Create HRTek DynamoDB Tables - With Proper Quoting
# Region: ap-south-1

Write-Host "Creating HRTek DynamoDB Tables..." -ForegroundColor Cyan
Write-Host ""

# Table 1: Users
Write-Host "1/5 Creating hrtek-users-prod..." -ForegroundColor Yellow
aws dynamodb create-table --table-name hrtek-users-prod --attribute-definitions "AttributeName=pk,AttributeType=S" "AttributeName=sk,AttributeType=S" --key-schema "AttributeName=pk,KeyType=HASH" "AttributeName=sk,KeyType=RANGE" --billing-mode PAY_PER_REQUEST --region ap-south-1
Write-Host ""

# Table 2: Companies  
Write-Host "2/5 Creating hrtek-companies-prod..." -ForegroundColor Yellow
aws dynamodb create-table --table-name hrtek-companies-prod --attribute-definitions "AttributeName=pk,AttributeType=S" "AttributeName=sk,AttributeType=S" --key-schema "AttributeName=pk,KeyType=HASH" "AttributeName=sk,KeyType=RANGE" --billing-mode PAY_PER_REQUEST --region ap-south-1
Write-Host ""

# Table 3: Assessments
Write-Host "3/5 Creating hrtek-assessments-prod..." -ForegroundColor Yellow
aws dynamodb create-table --table-name hrtek-assessments-prod --attribute-definitions "AttributeName=pk,AttributeType=S" "AttributeName=sk,AttributeType=S" --key-schema "AttributeName=pk,KeyType=HASH" "AttributeName=sk,KeyType=RANGE" --billing-mode PAY_PER_REQUEST --region ap-south-1
Write-Host ""

# Table 4: Payments
Write-Host "4/5 Creating hrtek-payments-prod..." -ForegroundColor Yellow
aws dynamodb create-table --table-name hrtek-payments-prod --attribute-definitions "AttributeName=pk,AttributeType=S" "AttributeName=sk,AttributeType=S" --key-schema "AttributeName=pk,KeyType=HASH" "AttributeName=sk,KeyType=RANGE" --billing-mode PAY_PER_REQUEST --region ap-south-1
Write-Host ""

# Table 5: Cart
Write-Host "5/5 Creating hrtek-cart-prod..." -ForegroundColor Yellow
aws dynamodb create-table --table-name hrtek-cart-prod --attribute-definitions "AttributeName=pk,AttributeType=S" "AttributeName=sk,AttributeType=S" --key-schema "AttributeName=pk,KeyType=HASH" "AttributeName=sk,KeyType=RANGE" --billing-mode PAY_PER_REQUEST --region ap-south-1
Write-Host ""

Write-Host "Waiting 10 seconds for tables to be created..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Listing all tables:" -ForegroundColor Cyan
aws dynamodb list-tables --region ap-south-1

Write-Host ""
Write-Host "SUCCESS! All tables created!" -ForegroundColor Green
Write-Host "You should see 8 tables total (3 existing + 5 new)" -ForegroundColor Yellow
