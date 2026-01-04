
import { verifyBusinessId } from "./app/services/decentro.server";

async function testDecentro() {
    console.log("----------------------------------------");
    console.log("Testing Decentro Connectivity...");
    console.log("----------------------------------------");

    // Test 1: GST Verification (Using a possibly dummy but valid-format GST)
    // 07AAGFF2194N1Z1 is a sample GST format
    const testGST = "07AAGFF2194N1Z1";

    try {
        console.log(`\n[Test 1] Verifying GST: ${testGST}`);
        const result = await verifyBusinessId("GST", testGST);

        console.log("\n>>> RESPONSE:");
        console.log(JSON.stringify(result, null, 2));

        if (result.status === 'success') {
            console.log("\n✅ Decentro API is reachable and returned Success.");
        } else if (result.status === 'error') {
            console.log("\n⚠️ Decentro API is reachable but returned Error (likely invalid ID, which is expected for dummy data).");
            console.log("Error Message: " + result.message);
        }

    } catch (e: any) {
        console.error("\n❌ FAILED to connect or execute:", e.message);
    }

    console.log("\n----------------------------------------");
}

testDecentro();
