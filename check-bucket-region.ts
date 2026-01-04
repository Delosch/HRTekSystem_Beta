// Test script to check S3 bucket region
import { S3Client, GetBucketLocationCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function checkBucketRegion() {
    console.log("🔍 Checking S3 bucket configuration...\n");
    console.log("Bucket Name:", BUCKET_NAME);
    console.log("Expected Region:", AWS_REGION);
    console.log("");

    try {
        // Create S3 client with us-east-1 (required for GetBucketLocation)
        const s3Client = new S3Client({
            region: "us-east-1", // GetBucketLocation must use us-east-1
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID!,
                secretAccessKey: AWS_SECRET_ACCESS_KEY!,
            },
        });

        const command = new GetBucketLocationCommand({
            Bucket: BUCKET_NAME!,
        });

        const response = await s3Client.send(command);

        // LocationConstraint is null for us-east-1, otherwise it's the region
        const actualRegion = response.LocationConstraint || "us-east-1";

        console.log("✅ Bucket found!");
        console.log("📍 Actual Bucket Region:", actualRegion);
        console.log("");

        if (actualRegion !== AWS_REGION) {
            console.log("⚠️  MISMATCH DETECTED!");
            console.log(`   Your .env says: ${AWS_REGION}`);
            console.log(`   But bucket is in: ${actualRegion}`);
            console.log("");
            console.log("🔧 FIX: Update your .env file:");
            console.log(`   AWS_REGION=${actualRegion}`);
        } else {
            console.log("✅ Region matches! Configuration is correct.");
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.Code === "NoSuchBucket") {
            console.log("\n💡 The bucket doesn't exist. Check the bucket name in .env");
        } else if (error.Code === "AccessDenied") {
            console.log("\n💡 Access denied. Check your AWS credentials");
        }
    }
}

checkBucketRegion()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
