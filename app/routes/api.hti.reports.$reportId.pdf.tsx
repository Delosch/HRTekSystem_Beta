import { type LoaderFunctionArgs } from "@remix-run/node";
import { renderToStream } from "@react-pdf/renderer";
import { requireUserSession } from "~/lib/session.server";
import { getAdvisoryReport } from "~/models/hti.model.server";
import { HTIReportPDF } from "~/components/HTIReportPDF";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);
    const { reportId } = params;

    if (!user.organisationId) {
        throw new Response("Unauthorized", { status: 401 });
    }

    if (!reportId) {
        throw new Response("Report ID required", { status: 400 });
    }

    const report = await getAdvisoryReport(user.organisationId, reportId);

    if (!report) {
        throw new Response("Report not found", { status: 404 });
    }

    // Render PDF to stream
    const stream = await renderToStream(<HTIReportPDF report={report} />);

    // Convert stream to readable stream (if needed by platform, but standard Response accepts standard streams usually)
    // Remix node adapter handles node streams well.

    return new Response(stream as any, {
        headers: {
            "Content-Type": "application/pdf",
            // "Content-Disposition": `attachment; filename="HTI_Advisory_${reportId}.pdf"`, // Force download
            "Content-Disposition": `inline; filename="HTI_Advisory_${reportId}.pdf"`, // Preview in browser
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
    });
}
