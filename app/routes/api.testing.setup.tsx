import { json, LoaderFunction } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { setupTestingEnvironment } from "~/utils/testing.server";

/**
 * Testing Route: Setup Complete Testing Environment
 * Navigate to /api/testing/setup to mark all engines complete
 */

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        return json({ error: "No company ID found" }, { status: 400 });
    }

    try {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`🧪 TESTING SETUP INITIATED`);
        console.log(`${"=".repeat(60)}\n`);

        const results = await setupTestingEnvironment(user.organisationId, user.userId);

        console.log(`\n${"=".repeat(60)}`);
        console.log(`✅ TESTING SETUP COMPLETE`);
        console.log(`${"=".repeat(60)}\n`);

        return json({
            success: true,
            message: "All engines marked as complete and payments verified",
            companyId: user.organisationId,
            userId: user.userId,
            results,
            nextSteps: [
                "Navigate to /dashboard to see eligibility widget",
                "Navigate to /hti to test HTI advisory generation",
                "Check console logs for eligibility and proposal messages"
            ]
        });
    } catch (error) {
        console.error("❌ Testing setup error:", error);
        return json({
            error: "Failed to setup testing environment",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
};

export default function TestingSetup() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Testing Setup</h1>
                <p className="text-gray-600 mb-6">
                    This page will automatically mark all 5 engines as 100% complete and create verified payment records.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-900 mb-2">What this does:</h2>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                        <li>Marks all 5 assessment engines as 100% complete</li>
                        <li>Creates verified payment records for each engine</li>
                        <li>Triggers eligibility check</li>
                        <li>Auto-generates transformation proposal if eligible</li>
                    </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h2 className="font-semibold text-green-900 mb-2">✅ Setup Complete!</h2>
                    <p className="text-green-800 text-sm mb-3">Check the server console for detailed logs.</p>
                    <div className="space-y-2">
                        <a
                            href="/dashboard"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
                        >
                            View Dashboard (Eligibility Widget)
                        </a>
                        <a
                            href="/hti"
                            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
                        >
                            Test HTI Advisory
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
