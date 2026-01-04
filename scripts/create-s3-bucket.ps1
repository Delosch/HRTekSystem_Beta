# HRTek AWS S3 Bucket Creation Script

$BUCKET_NAME = "hrtek-storage-prod"
$REGION = "us-east-1"

Write-Host "Creating S3 bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Create the bucket
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION

if ($?) {
    Write-Host "SUCCESS: Bucket created!" -ForegroundColor Green
}
else {
    Write-Host "FAILED: Bucket creation failed (may already exist)" -ForegroundColor Red
}

# Enable versioning
Write-Host "Enabling versioning..." -ForegroundColor Cyan
aws s3api put-bucket-versioning `
    --bucket $BUCKET_NAME `
    --versioning-configuration Status=Enabled

if ($?) {
    Write-Host "SUCCESS: Versioning enabled!" -ForegroundColor Green
}

# Block public access
Write-Host "Blocking public access..." -ForegroundColor Cyan
aws s3api put-public-access-block `
    --bucket $BUCKET_NAME `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

if ($?) {
    Write-Host "SUCCESS: Public access blocked!" -ForegroundColor Green
}

# Create folder structure
Write-Host "Creating folder structure..." -ForegroundColor Cyan

$folders = @(
    "payment-proofs/",
    "assessment-reports/",
    "company-documents/",
    "admin-uploads/"
)

foreach ($folder in $folders) {
    aws s3api put-object --bucket $BUCKET_NAME --key $folder
    Write-Host "  Created: $folder" -ForegroundColor Gray
}

Write-Host "SUCCESS: Folder structure created!" -ForegroundColor Green

# Enable encryption
Write-Host "Enabling encryption..." -ForegroundColor Cyan
aws s3api put-bucket-encryption `
    --bucket $BUCKET_NAME `
    --server-side-encryption-configuration '{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}'

if ($?) {
    Write-Host "SUCCESS: Encryption enabled!" -ForegroundColor Green
}

# Verify bucket
Write-Host ""
Write-Host "Bucket details:" -ForegroundColor Cyan
aws s3api get-bucket-location --bucket $BUCKET_NAME
aws s3 ls s3://$BUCKET_NAME/

Write-Host ""
Write-Host "S3 bucket setup complete!" -ForegroundColor Green
Write-Host "Bucket name: $BUCKET_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: Update your .env file with bucket name" -ForegroundColor Cyan
