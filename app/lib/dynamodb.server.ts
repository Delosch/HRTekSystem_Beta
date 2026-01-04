import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// ----------------------------------------------------
// Load environment variables (match your senior's .env)
// ----------------------------------------------------
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Don't throw immediately - let the getter functions handle it
function validateEnvVars() {
  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error("❌ Missing AWS DynamoDB environment variables:");
    console.error("  AWS_REGION:", AWS_REGION ? "✅" : "❌ MISSING");
    console.error("  AWS_ACCESS_KEY_ID:", AWS_ACCESS_KEY_ID ? "✅" : "❌ MISSING");
    console.error("  AWS_SECRET_ACCESS_KEY:", AWS_SECRET_ACCESS_KEY ? "✅" : "❌ MISSING");
    throw new Error("Missing AWS DynamoDB environment variables. Check .env file.");
  }
}

// ----------------------------------------------------
// Create DynamoDB Client
// ----------------------------------------------------
let dynamoClient: DynamoDBClient | null = null;
let dynamoDocClient: DynamoDBDocumentClient | null = null;

export function getDynamoDBClient(): DynamoDBClient {
  if (dynamoClient) return dynamoClient;

  // Validate environment variables when actually needed
  validateEnvVars();

  dynamoClient = new DynamoDBClient({
    region: AWS_REGION as string,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID as string,
      secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
    },
  });

  console.log("✅ DynamoDBClient initialized");
  return dynamoClient;
}

// ----------------------------------------------------
// Document Client Wrapper
// ----------------------------------------------------
export function getDynamoDBDocumentClient(): DynamoDBDocumentClient {
  if (dynamoDocClient) return dynamoDocClient;

  dynamoDocClient = DynamoDBDocumentClient.from(getDynamoDBClient(), {
    marshallOptions: { removeUndefinedValues: true },
  });

  console.log("✅ DynamoDBDocumentClient initialized");
  return dynamoDocClient;
}

// Optional export
export const ddbDocClient = getDynamoDBDocumentClient();
