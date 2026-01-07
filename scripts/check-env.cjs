const fs = require('fs');
const path = require('path');

const REQUIRED_ENV = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'DYNAMODB_TABLE_NAME',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'HCAPTCHA_SITE_KEY',
    'HCAPTCHA_SECRET_KEY'
];

function checkEnv() {
    const envPath = path.join(process.cwd(), '.env');

    if (!fs.existsSync(envPath)) {
        console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: .env file is missing!');
        console.log('\x1b[33m%s\x1b[0m', 'Please copy .env.template to .env and fill in the required values.');
        process.exit(1);
    }

    // Simple check for missing keys
    const envContent = fs.readFileSync(envPath, 'utf8');
    const missingKeys = [];

    REQUIRED_ENV.forEach(key => {
        if (!envContent.includes(key + '=') || envContent.includes(key + '=""') || envContent.includes(key + "=''")) {
            missingKeys.push(key);
        }
    });

    if (missingKeys.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Missing required environment variables in .env:');
        missingKeys.forEach(key => console.log(`   - ${key}`));
        console.log('\x1b[33m%s\x1b[0m', '\nPlease update your .env file with valid credentials.');
        process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', '✅ Environment variables validated successfully.');
}

checkEnv();
