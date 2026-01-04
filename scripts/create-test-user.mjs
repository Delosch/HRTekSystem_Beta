/**
 * Create Test User Script
 * 
 * Creates a test user (mass@mail.com) for development testing
 * 
 * Usage: node scripts/create-test-user.mjs
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1"
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "hrtek-users-prod";
const BCRYPT_SALT_ROUNDS = 12;

async function createTestUser() {
    console.log("🚀 Creating Test User");
    console.log("=".repeat(60));
    console.log(`📊 Table: ${TABLE_NAME}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION || "us-east-1"}`);
    console.log("=".repeat(60));

    const testEmail = "mass@mail.com";
    const testPassword = "Test@123";
    const testPhone = "(+91)9876543210"; // Format: (+countrycode)number

    try {
        // Check if user already exists
        console.log("\n🔍 Checking if user already exists...");
        const queryCommand = new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": testEmail,
            },
            Limit: 1,
        });

        const existingUser = await ddbDocClient.send(queryCommand);

        if (existingUser.Count && existingUser.Count > 0) {
            console.log("✓ User already exists!");
            console.log("\n📧 Email:", testEmail);
            console.log("🔑 Password:", testPassword);
            console.log("\n✅ You can now use test-login!");
            return;
        }

        // Hash password
        console.log("\n🔐 Hashing password...");
        const passwordHash = await bcrypt.hash(testPassword, BCRYPT_SALT_ROUNDS);

        // Create user
        const userId = randomUUID();
        const newUser = {
            pk: `USER#${userId}`,
            sk: "PROFILE",
            profile_type: "USER",
            email: testEmail,
            phone: testPhone,
            first_name: "Test",
            last_name: "User",
            password_hash: passwordHash,
            is_term_agree: true,
            is_marketing_allowed: false,
            is_verified_phone: false,
            is_verified_email: false,
            two_fa_enabled: false,
            onboardingStatus: "None",
            organisationId: "",
            country_iso: "IN",
            createdAt: new Date().toISOString(),
        };

        console.log("💾 Creating user in DynamoDB...");
        await ddbDocClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newUser,
        }));

        console.log("\n" + "=".repeat(60));
        console.log("✅ TEST USER CREATED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log("\n📧 Email:", testEmail);
        console.log("🔑 Password:", testPassword);
        console.log("📱 Phone:", testPhone);
        console.log("👤 User ID:", userId);
        console.log("\n🎉 You can now use test-login!");
        console.log("\n💡 To test:");
        console.log("   1. Navigate to /test-login");
        console.log("   2. Or use the regular login with these credentials");

    } catch (error) {
        console.error("\n❌ Error creating test user:", error);
        process.exit(1);
    }
}

createTestUser();
