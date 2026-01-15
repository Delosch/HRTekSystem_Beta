import dotenv from "dotenv";
dotenv.config();

export const env = {
  // AWS Configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  
  // DynamoDB Tables
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
  DYNAMODB_USERS_TABLE: process.env.DYNAMODB_USERS_TABLE,
  DYNAMODB_COMPANIES_TABLE: process.env.DYNAMODB_COMPANIES_TABLE,
  DYNAMODB_ASSESSMENTS_TABLE: process.env.DYNAMODB_ASSESSMENTS_TABLE,
  DYNAMODB_PAYMENTS_TABLE: process.env.DYNAMODB_PAYMENTS_TABLE,
  DYNAMODB_CART_TABLE: process.env.DYNAMODB_CART_TABLE,
  DYNAMODB_QUESTIONS_TABLE: process.env.DYNAMODB_QUESTIONS_TABLE,
  DYNAMODB_SESSIONS_TABLE: process.env.DYNAMODB_SESSIONS_TABLE,

  // S3 Configuration
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION || process.env.AWS_REGION,

  // SMS Configuration
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID,

  // Email Configuration (SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_FROM: process.env.SMTP_FROM,

  // Captcha Configuration
  VITE_HCAPTCHA_SITE_KEY: process.env.VITE_HCAPTCHA_SITE_KEY,
  HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,

  // App Configuration
  NODE_ENV: process.env.NODE_ENV,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  APP_URL: process.env.APP_URL,
  API_URL: process.env.API_URL,
};
