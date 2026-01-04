import dotenv from "dotenv";
dotenv.config();

export const env = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
};
