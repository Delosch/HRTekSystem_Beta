# Backup Existing DynamoDB Tables

$tables = @("b2b_platform", "Questions", "sessions")
$backupDate = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "Creating backups of existing tables..." -ForegroundColor Cyan
Write-Host "Backup timestamp: $backupDate" -ForegroundColor Gray
Write-Host ""

foreach ($table in $tables) {
    Write-Host "Backing up table: $table" -ForegroundColor Yellow
    
    try {
        # Create on-demand backup
        $result = aws dynamodb create-backup `
            --table-name $table `
            --backup-name "$table-backup-$backupDate" `
            --region us-east-1 `
            --output json | ConvertFrom-Json
        
        Write-Host "  SUCCESS: Backup created: $($result.BackupDetails.BackupName)" -ForegroundColor Green
        Write-Host "  Backup ARN: $($result.BackupDetails.BackupArn)" -ForegroundColor Gray
        Write-Host ""
    }
    catch {
        Write-Host "  FAILED to backup $table" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "All backups completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To list all backups:" -ForegroundColor Cyan
Write-Host "aws dynamodb list-backups --region us-east-1" -ForegroundColor Gray
Write-Host ""
Write-Host "To restore a backup:" -ForegroundColor Cyan
Write-Host "aws dynamodb restore-table-from-backup --target-table-name TABLE_NAME --backup-arn BACKUP_ARN" -ForegroundColor Gray
