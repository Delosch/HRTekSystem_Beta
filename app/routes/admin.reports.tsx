import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Link, useLoaderData, Form, useNavigation, useActionData, useMatches, Outlet } from "@remix-run/react";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ClockIcon,
    SparklesIcon,
    BeakerIcon,
    CpuChipIcon,
    ChartBarIcon,
    ArrowTopRightOnSquareIcon,
    FunnelIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
    reportId: string;
    companyId: string;
    companyName: string;
    engineName: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected";
}

export const loader: LoaderFunction = async () => {
    const { getAllAnalysisReports } = await import("~/utils/analysis.server");
    const { getCompanyProfile } = await import("~/models/company.model.server");

    const allReports = await getAllAnalysisReports();

    const reports: Report[] = await Promise.all(allReports.map(async (item: any) => {
        const companyId = item.pk.replace("COMPANY#", "");
        let companyName = "Unknown Company";
        try {
            const profile = await getCompanyProfile(companyId);
            if (profile) {
                companyName = profile.company_name || profile.brand_name || companyId;
            }
        } catch (e) {
            console.error(`Failed to fetch profile for ${companyId}`, e);
        }

        return {
            reportId: item.sk,
            companyId: companyId,
            companyName: companyName,
            engineName: item.section || "Unknown Engine",
            submittedAt: item.createdAt || new Date().toISOString(),
            status: item.status || "approved"
        };
    }));

    reports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return json({ reports });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const reportId = formData.get("reportId") as string;
    const action = formData.get("action") as string;
    const companyId = formData.get("companyId") as string;

    if (!reportId || !companyId || !action) {
        return json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { updateAnalysisStatus, getAnalysisById } = await import("~/utils/analysis.server");

    const pk = `COMPANY#${companyId}`;

    if (action === "approve") {
        // Fetch report to check which engine it is
        const reports = await getAnalysisById(pk, reportId);
        const report = reports ? reports[0] : null;

        if (report && report.section === "HR Transformation Roadmap Generator") {
            const { hasVerifiedPaymentForEngines } = await import("~/models/payment.model.server");
            const hasPayment = await hasVerifiedPaymentForEngines(companyId, ["HR Transformation Roadmap Generator"]);
            if (!hasPayment) {
                return json({
                    success: false,
                    message: "Approval Denied: No verified payment found for 'HR Transformation Roadmap Generator'. Please ensure the company has purchased this engine before approving."
                }, { status: 403 });
            }
        }
    }

    const status = action === "approve" ? "approved" : "rejected";
    const success = await updateAnalysisStatus(pk, reportId, status);

    if (success && action === "approve") {
        try {
            const { autoGenerateProposal } = await import("~/services/proposal.service.server");
            const proposalResult = await autoGenerateProposal(companyId);
            if (proposalResult.success) {
                console.log("Proposal auto-generated:", proposalResult.message);
            }
        } catch (err) {
            console.error("Failed to trigger proposal generation:", err);
        }
    }

    return json({ success, message: success ? `Report ${status} successfully` : "Failed to update report status" });
};

export default function AdminReports() {
    const { reports } = useLoaderData<{ reports: Report[] }>();
    const actionData = useActionData<{ success?: boolean; message?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const matches = useMatches();

    // When a child route is active (e.g. /admin/reports/:reportId), render only the child
    const isOnDetailRoute = matches.some(m => m.id.includes("$reportId"));
    if (isOnDetailRoute) {
        return <Outlet />;
    }

    const getStatusStyles = (status: string) => {
        const styles = {
            pending: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: ClockIcon, text: "Needs Review" },
            approved: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircleIcon, text: "Approved" },
            rejected: { color: "text-rose-600 bg-rose-50 border-rose-100", icon: XCircleIcon, text: "Rejected" },
        };
        return styles[status as keyof typeof styles] || styles.approved;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-4 animate-in fade-in duration-700">
            {actionData?.success === false && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                    <XCircleIcon className="h-6 w-6" />
                    <span className="font-bold">{actionData.message}</span>
                </div>
            )}
            {actionData?.success === true && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6" />
                    <span className="font-bold">{actionData.message}</span>
                </div>
            )}
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 px-3 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                            <CpuChipIcon className="h-3.5 w-3.5" />
                            Report Pipeline
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Report <span className="text-indigo-600">Hub</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Review and approve reports generated by the AI engines.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Volumes</p>
                            <p className="text-xl font-black text-indigo-600">{reports.length}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-100" />
                        <ChartBarIcon className="h-8 w-8 text-indigo-200" />
                    </div>
                </div>
            </div>

            {/* Selection Filters */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-wrap items-center gap-4">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select className="px-6 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest appearance-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer">
                        <option value="all">All Status</option>
                        <option value="pending">Needs Review</option>
                        <option value="approved">Approved</option>
                    </select>
                    <button className="p-3 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-indigo-600 transition-colors shadow-sm">
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Reports Field */}
            <div className="grid grid-cols-1 gap-6">
                {reports.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-32 text-center"
                    >
                        <BeakerIcon className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">No Reports Found</h3>
                        <p className="text-gray-400 font-medium">All generated reports have been processed.</p>
                    </motion.div>
                ) : (
                    reports.map((report, idx) => {
                        const status = getStatusStyles(report.status);
                        return (
                            <motion.div
                                key={report.reportId}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-xl transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-slate-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <SparklesIcon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{report.companyName}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                                <BeakerIcon className="h-4 w-4 text-indigo-300" />
                                                Engine Output: {report.engineName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Generated</p>
                                            <p className="text-xs font-bold text-gray-700">{new Date(report.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                                <a
                                                href={`/admin/reports/${encodeURIComponent(report.reportId)}`}
                                                className="h-12 px-6 bg-white border border-gray-100 text-gray-900 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:border-indigo-600 hover:text-indigo-600 shadow-sm"
                                            >
                                                View
                                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                            </a>

                                            {report.status === "pending" && (
                                                <div className="flex items-center gap-2">
                                                    <Form method="post">
                                                        <input type="hidden" name="reportId" value={report.reportId} />
                                                        <input type="hidden" name="companyId" value={report.companyId} />
                                                        <input type="hidden" name="action" value="approve" />
                                                        <button
                                                            disabled={isSubmitting}
                                                            className="h-12 px-6 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                    </Form>
                                                    <Form method="post">
                                                        <input type="hidden" name="reportId" value={report.reportId} />
                                                        <input type="hidden" name="companyId" value={report.companyId} />
                                                        <input type="hidden" name="action" value="reject" />
                                                        <button
                                                            disabled={isSubmitting}
                                                            className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                                        >
                                                            <XCircleIcon className="h-6 w-6" />
                                                        </button>
                                                    </Form>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Background Accents */}
                                <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
