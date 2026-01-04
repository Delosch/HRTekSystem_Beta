import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
    DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Dummy Data (replace with actual data fetching)
type AiReportStatus = "Pending Review" | "Approved" | "Rejected";

interface AiReport {
    id: string;
    engine: string;
    submittedBy: string;
    submittedAt: string;
    status: AiReportStatus;
    previewUrl: string; // Link to a preview or full report viewer
}

const aiReportsData: Record<string, AiReport[]> = {
    "org-101": [
        {
            id: "ai-001",
            engine: "Vendor Fit Engine",
            submittedBy: "Bob Smith",
            submittedAt: "2025-07-23 03:30 PM",
            status: "Pending Review",
            previewUrl: "/admin/ai-reports/ai-001/preview", // Placeholder
        },
        {
            id: "ai-002",
            engine: "Roadmap Generator",
            submittedBy: "Alice Johnson",
            submittedAt: "2025-07-22 09:45 AM",
            status: "Approved",
            previewUrl: "/admin/ai-reports/ai-002/preview",
        },
        {
            id: "ai-003",
            engine: "Vendor Fit Engine",
            submittedBy: "Charlie Brown",
            submittedAt: "2025-07-20 01:00 PM",
            status: "Rejected",
            previewUrl: "/admin/ai-reports/ai-003/preview",
        },
    ],
    "org-102": [
        {
            id: "ai-004",
            engine: "Market Analysis Tool",
            submittedBy: "Eve Green",
            submittedAt: "2025-07-26 11:00 AM",
            status: "Pending Review",
            previewUrl: "/admin/ai-reports/ai-004/preview",
        },
    ],
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const orgId = "org-101"//params.orgId;
    const reports = aiReportsData[orgId || ""] || [];
    return json({ reports });
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
                                            <button
                                                type="button"
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100 inline-flex items-center"
                                                title="View Full Report"
                                            >
                                                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                                                <span className="ml-1">View</span>
                                            </button>
                                            {report.status === "Pending Review" && (
                                                <>
                                                    <button
                                                        type="button"
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
                                                        type="button"
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                                                        title="Reject & Comment"
                                                    >
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                </>
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