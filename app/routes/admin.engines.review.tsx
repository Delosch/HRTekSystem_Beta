import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { redirect } from "@remix-run/node";
import { CheckCircle, XCircle, Clock, FileText, Send } from "lucide-react";
import { completedEngine } from "~/models/engine.model";
import { approveEngine, rejectEngine, bulkApproveEngines } from "~/services/engine.approval.service";
import { generateAndDispatchReport } from "~/services/report.dispatch.service";

interface EngineReview {
    companyId: string;
    companyName: string;
    engineName: string;
    completedAt: string;
    status: "pending" | "approved" | "rejected";
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserSession(request);

    // TODO: Implement proper admin role check
    // For now, allow all authenticated users to access
    // In production, check user.role === "admin"

    // TODO: Fetch all completed engines from all companies
    // For now, return mock data structure
    const engineReviews: EngineReview[] = [];

    return json({ engineReviews, user });
};

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUserSession(request);

    // TODO: Implement proper admin role check
    // For now, allow all authenticated users

    const formData = await request.formData();
    const action = formData.get("action");
    const companyId = formData.get("companyId") as string;
    const engineName = formData.get("engineName") as string;

    if (action === "approve") {
        const result = await approveEngine(companyId, engineName, user.userId);

        if (result.success) {
            // Generate and dispatch report
            await generateAndDispatchReport(companyId, engineName);
        }

        return json(result);
    }

    if (action === "reject") {
        const reason = formData.get("reason") as string;
        const result = await rejectEngine(companyId, engineName, user.userId, reason);
        return json(result);
    }

    if (action === "bulk_approve") {
        const selectedIds = formData.get("selectedIds") as string;
        const selected = JSON.parse(selectedIds);
        const result = await bulkApproveEngines(selected, user.userId);
        return json(result);
    }

    return json({ error: "Invalid action" }, { status: 400 });
};

export default function AdminEnginesReview() {
    const { engineReviews } = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

    const filteredReviews = engineReviews.filter((review: EngineReview) => {
        if (filter === "all") return true;
        return review.status === filter;
    });

    const handleApprove = (companyId: string, engineName: string) => {
        const formData = new FormData();
        formData.append("action", "approve");
        formData.append("companyId", companyId);
        formData.append("engineName", engineName);
        submit(formData, { method: "post" });
    };

    const handleReject = (companyId: string, engineName: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        const formData = new FormData();
        formData.append("action", "reject");
        formData.append("companyId", companyId);
        formData.append("engineName", engineName);
        formData.append("reason", reason);
        submit(formData, { method: "post" });
    };

    const handleBulkApprove = () => {
        if (selected.size === 0) {
            alert("No engines selected");
            return;
        }

        const selectedArray = Array.from(selected).map(id => {
            const [companyId, engineName] = id.split("|");
            return { companyId, engineName };
        });

        const formData = new FormData();
        formData.append("action", "bulk_approve");
        formData.append("selectedIds", JSON.stringify(selectedArray));
        submit(formData, { method: "post" });
        setSelected(new Set());
    };

    const toggleSelect = (companyId: string, engineName: string) => {
        const id = `${companyId}|${engineName}`;
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Engine Review Dashboard</h1>
                    <p className="text-gray-600">Review and approve completed engine assessments</p>
                </div>

                {/* Filters and Bulk Actions */}
                <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {selected.size > 0 && (
                        <button
                            onClick={handleBulkApprove}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Approve Selected ({selected.size})
                        </button>
                    )}
                </div>

                {/* Engine Reviews Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const allIds = filteredReviews
                                                    .filter((r: EngineReview) => r.status === "pending")
                                                    .map((r: EngineReview) => `${r.companyId}|${r.engineName}`);
                                                setSelected(new Set(allIds));
                                            } else {
                                                setSelected(new Set());
                                            }
                                        }}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Engine</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No engine reviews found
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review: EngineReview) => {
                                    const id = `${review.companyId}|${review.engineName}`;
                                    const isSelected = selected.has(id);

                                    return (
                                        <tr key={id} className={isSelected ? "bg-blue-50" : ""}>
                                            <td className="px-6 py-4">
                                                {review.status === "pending" && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(review.companyId, review.engineName)}
                                                        className="rounded"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {review.companyName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {review.engineName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(review.completedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {review.status === "pending" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                                {review.status === "approved" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Approved
                                                    </span>
                                                )}
                                                {review.status === "rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3" />
                                                        Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {review.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(review.companyId, review.engineName)}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(review.companyId, review.engineName)}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-1"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
