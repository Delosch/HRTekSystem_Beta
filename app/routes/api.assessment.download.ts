import { LoaderFunction, json } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { getAnswerSheetByAssessmentName } from "~/utils/question.utils";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const user = await requireUserSession(request);
        if (!user) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!user.organisationId) {
            return json({ error: "Organization ID not found" }, { status: 400 });
        }

        const url = new URL(request.url);
        const engineName = url.searchParams.get("engine");

        if (!engineName) {
            return json({ error: "Engine name is required" }, { status: 400 });
        }

        // Fetch the assessment response data
        const responseData = await getAnswerSheetByAssessmentName(
            user.organisationId,
            engineName
        );

        if (!responseData) {
            return json({ error: "No response data found" }, { status: 404 });
        }

        // Create a comprehensive download object
        const downloadData = {
            engine: engineName,
            company: user.organisationId,
            user: {
                id: user.userId,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
            },
            responses: responseData,
            metadata: {
                downloadedAt: new Date().toISOString(),
                version: "1.0",
            },
        };

        // Return as JSON file
        return new Response(JSON.stringify(downloadData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${engineName.replace(/\s+/g, '_')}_response.json"`,
            },
        });
    } catch (error) {
        console.error("Error downloading assessment:", error);
        return json({ error: "Failed to download assessment" }, { status: 500 });
    }
};
