// Simple test to verify S3 upload works with us-east-1
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

async function testS3Upload() {
    console.log("🧪 Testing S3 Upload Configuration\n");

    const AWS_REGION = process.env.AWS_REGION;
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;

    console.log("Configuration:");
    console.log("  AWS_REGION:", AWS_REGION);
    console.log("  BUCKET_NAME:", BUCKET_NAME);
    console.log("");

    try {
        const s3Client = new S3Client({
            region: AWS_REGION!,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID!,
                secretAccessKey: AWS_SECRET_ACCESS_KEY!,
            },
        });

        const testContent = `Test file uploaded at ${new Date().toISOString()}`;
        const testKey = `test-uploads/test-${Date.now()}.txt`;

        console.log("☁️  Uploading test file to S3...");
        console.log("   Key:", testKey);

        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME!,
                Key: testKey,
                Body: Buffer.from(testContent),
                ContentType: "text/plain",
            })
        );

        console.log("\n✅ SUCCESS! S3 upload works correctly!");
        console.log("   File uploaded to:", `s3://${BUCKET_NAME}/${testKey}`);
        console.log("\n🎉 Payment proof uploads should work now!");
        console.log("   Just restart your dev server and try again.");

    } catch (error: any) {
        console.error("\n❌ FAILED! S3 upload error:");
        console.error("   Error:", error.message);

        if (error.Code === "PermanentRedirect") {
            console.log("\n⚠️  Still getting PermanentRedirect error!");
            console.log("   This means the server hasn't loaded the new AWS_REGION yet.");
            console.log("\n🔧 Solution:");
            console.log("   1. STOP the dev server (Ctrl+C)");
            console.log("   2. Run: npm run dev");
            console.log("   3. Wait for it to fully start");
            console.log("   4. Try payment upload again");
        }
    }
}

testS3Upload()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
