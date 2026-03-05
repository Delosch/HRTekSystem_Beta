import { LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { DatabaseRecord } from "./schemas";
import { getCompanyProfile } from "~/models/company.model.server";
import DigitalMaturityReport from "~/components/reports/DigitalMaturityReport";
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";

export const loader: LoaderFunction = async ({ request, params }: { request: Request, params: Params }) => {
    try {
        const user = await requireUserSession(request);
        if (!user || !user.organisationId) {
            return null
        }
        if (!params.id) {
            throw new Response("Method Not Allowed", { status: 404 })
        }

        const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, params.id);
        if (!data) {
            throw new Response("No assessment data found", { status: 404 });
        }
        const company_info = await getCompanyProfile(user.organisationId)
        const brand_name = company_info?.brand_name || company_info?.company_name || "Confidential Client"

        // Check URL for report type (detailed vs standard)
        const url = new URL(request.url);
        const reportType = url.searchParams.get('type') as 'detailed' | 'standard' || 'standard';

        return {
            data,
            brand_name,
            assessmentId: params.id || "Unknown Assessment",
            reportType
        };
    }
    catch (e) {
        console.error("Something unintended just happen\n", e)
        throw new Response("Un-intended error has occured", { status: 500 });
    }
}

export const action = async ({ request, params }: { request: Request, params: Params }) => {
    const user = await requireUserSession(request);
    if (!user || !user.organisationId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const engineId = params.id;

    if (body.intent === "generate_report") {
        const engineTypeMap: Record<string, string> = {
            "Profiling Assessment": "sharedServices",
            "Digital Maturity Assessment": "sharedServices",
        };
        const engineType = engineTypeMap[engineId || ""] || "sharedServices";

        const aggregatedData = {
            companyId: user.organisationId,
            timestamp: new Date().toISOString(),
            engines: {
                [engineType]: {
                    engineName: engineId,
                    progress: 100,
                    responses: body.answers || {},
                    scores: {},
                    aiAnalysis: {}
                }
            },
            completedEnginesCount: 1,
            totalEngines: 1
        };

        try {
            const advisory = await generateHTIAdvisory(aggregatedData as any, engineType as any);
            await saveAdvisoryReport(
                user.organisationId,
                user.userId,
                advisory,
                aggregatedData as any
            );
            return Response.json({ success: true, advisory });
        } catch (error) {
            console.error("AI Generation Error in v2 route:", error);
            return Response.json({ error: "Failed to generate AI report" }, { status: 500 });
        }
    }

    return Response.json({ error: "Invalid intent" }, { status: 400 });
};

interface LoaderReturn {
    data: DatabaseRecord,
    brand_name: string,
    assessmentId: string,
    reportType: 'detailed' | 'standard'
}

export default function Report() {
    const loaderData = useLoaderData<LoaderReturn>();

    return (
        <DigitalMaturityReport
            data={loaderData.data}
            brandName={loaderData.brand_name}
            assessmentId={loaderData.assessmentId}
            reportType="standard"
        />
    );
}
