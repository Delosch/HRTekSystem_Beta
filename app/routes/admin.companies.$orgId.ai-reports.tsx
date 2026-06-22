import { useLoaderData, Form, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
    DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { getCompanyAdvisories, updateApprovalStatus } from "~/models/hti.model.server";
import { getEnhancedUser } from "~/utils/user.server";

type AiReportStatus = "Pending Review" | "Approved" | "Rejected";

interface AiReport {
    id: string;
    engine: string;
    submittedBy: string;
    submittedAt: string;
    status: AiReportStatus;
    previewUrl: string;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const orgId = params.orgId;
    if (!orgId) throw new Error("Organization ID required");

    const reports = await getCompanyAdvisories(orgId);

    // Transform data for the UI
    const transformedReports = reports.map(r => ({
        id: r.reportId,
        engine: "HTI Advisory Report",
        submittedBy: r.generatedBy,
        submittedAt: new Date(r.generatedAt).toLocaleString(),
        status: r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Pending Review",
        previewUrl: `/api/hti/reports/${r.reportId}/pdf?companyId=${orgId}`,
        companyId: r.companyId
    }));

    return json({ reports: transformedReports, orgId });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await getEnhancedUser(request);
    const formData = await request.formData();
    const action = formData.get("_action") as string;
    const reportId = formData.get("reportId") as string;
    const orgId = params.orgId || "";

    if (action === "approve") {
        await updateApprovalStatus(orgId, reportId, "approved", user.userId, "Approved via Admin Panel");
        return json({ success: true, message: "Report approved successfully" });
    }

    if (action === "reject") {
        await updateApprovalStatus(orgId, reportId, "rejected", user.userId, "Rejected via Admin Panel");
        return json({ success: true, message: "Report rejected" });
    }

    return json({ success: false, error: "Invalid action" });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function CompanyAIReportsPage() {
    const { reports } = useLoaderData<typeof loader>();

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-5">AI Report Reviews</h2>

            {reports.length === 0 ? (
                <p className="text-gray-600">No AI reports found for this company.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Engine
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Submitted By
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Submitted At
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* ... inside the table loop ... */}

                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {report.engine}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.submittedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.submittedAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={classNames(
                                                report.status === "Approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : report.status === "Rejected"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-yellow-100 text-yellow-800",
                                                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                            )}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <a
                                                href={report.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100 inline-flex items-center"
                                                title="View Full Report"
                                            >
                                                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                                                <span className="ml-1">View</span>
                                            </a>
                                            {report.status === "Pending Review" && (
                                                <Form method="post" className="flex items-center space-x-2">
                                                    <input type="hidden" name="reportId" value={report.id} />
                                                    <button
                                                        type="submit"
                                                        name="_action"
                                                        value="approve"
                                                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-gray-100"
                                                        title="Approve & Forward"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100"
                                                        title="Update (Manual Edit)"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        name="_action"
                                                        value="reject"
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                                                        title="Reject & Comment"
                                                    >
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                </Form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>)}
        </div>
    )
}