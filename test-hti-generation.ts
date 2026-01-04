/**
 * Simple script to test HTI generation directly
 * Run with: npx tsx test-hti-generation.ts
 */

import { config } from "dotenv";

// Load environment variables
config();

const COMPANY_ID = "0867dc3e-ec46-46ac-96e2-fe6fd9705d7b";
const API_URL = "http://localhost:5173/api/hti/generate";

async function testHTIGeneration() {
    console.log("🧪 Testing HTI Generation\n");
    console.log(`Company ID: ${COMPANY_ID}`);
    console.log(`API URL: ${API_URL}\n`);

    try {
        console.log("📤 Sending POST request to HTI API...\n");

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                companyId: COMPANY_ID
            })
        });

        console.log(`📥 Response status: ${response.status} ${response.statusText}\n`);

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ HTI Generation Failed:");
            console.error(JSON.stringify(result, null, 2));
            process.exit(1);
        }

        console.log("✅ HTI Generation Successful!\n");
        console.log("Response:");
        console.log(JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

testHTIGeneration();
