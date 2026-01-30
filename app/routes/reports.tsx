import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getAllAnalysesForCompany } from "~/utils/analysis.server";
import { getCompanyPayments } from "~/models/payment.model.server";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { getEnhancedUser } from "~/utils/user.server";
import { FileText, Lock, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReportItem {
    id: string;
    section: string;
    createdAt: string;
    status: string;
    isPaid: boolean;
    isVerified: boolean;
    paymentStatus?: string;
    reportUrl: string;
}

interface LoaderData {
    user: any;
    reports: ReportItem[];
    totalReports: number;
    unlockedReports: number;
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getEnhancedUser(request);

    if (!user || !user.organisationId) {
        throw redirect('/auth');
    }

    // Fetch all AI-generated reports for this company
    const allAnalyses = await getAllAnalysesForCompany(user.organisationId);

    // Fetch all payments for this company to determine status
    const allPayments = await getCompanyPayments(user.organisationId);

    // Verified engines (payment_verified)
    const verifiedEngines = allPayments
        .filter(p => p.status === "payment_verified")
        .flatMap(payment => payment.items?.map((item: any) => item.engineName.trim()) || []);

    // Paid engines (payment_submitted or payment_verified)
    const paidEngines = allPayments
        .filter(p => p.status === "payment_submitted" || p.status === "payment_verified")
        .flatMap(payment => payment.items?.map((item: any) => item.engineName.trim()) || []);

    console.log(`[Reports Page] User: ${user.organisationId}`);
    console.log(`[Reports Page] Total Analyses Found: ${allAnalyses.length}`);
    console.log(`[Reports Page] Paid Engines:`, paidEngines);
    console.log(`[Reports Page] Verified Engines:`, verifiedEngines);

    // Map to report route URLs
    const reportRouteMap: Record<string, string> = {
        "HCM Vendor Fit Engine": `/fit/report/HCM%20Vendor%20Fit%20Engine`,
        "Digital Maturity Assessment": `/consulting-report/Digital%20Maturity%20Assessment`,
        "Profiling Assessment": `/consulting-report/Profiling%20Assessment`,
        "HR Transformation Roadmap Generator": `/consulting-report/HR%20Transformation%20Roadmap%20Generator`,
        "Shared Service Designer": `/consulting-report/Shared%20Service%20Designer`,
        "Intelligent Change Management": `/consulting-report/Intelligent%20Change%20Management`,
        "Change Management Readiness": `/consulting-report/Change%20Management%20Readiness`,
        "HR Technology Maturity Analysis": `/consulting-report/HR%20Technology%20Maturity%20Analysis`,
        "HR Tech Maturity Analysis": `/consulting-report/HR%20Tech%20Maturity%20Analysis`
    };

    // Process reports - ONLY include reports that are paid for or user is admin
    const isAdmin = (user as any).role === "ADMIN";

    const reports: ReportItem[] = allAnalyses
        .map((analysis: any) => {
            const engineName = analysis.section.trim();
            const isVerified = verifiedEngines.includes(engineName) || isAdmin;
            const isPaid = paidEngines.includes(engineName) || isAdmin;
            const reportUrl = reportRouteMap[engineName] || `/consulting-report/${encodeURIComponent(engineName)}`;

            return {
                id: analysis.sk,
                section: engineName,
                createdAt: analysis.createdAt,
                status: analysis.status || 'approved',
                isPaid,
                isVerified,
                reportUrl
            };
        });

    // Sort by creation date (newest first)
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unlockedReports = reports.filter(r => r.isVerified).length;

    return json<LoaderData>({
        user,
        reports,
        totalReports: reports.length,
        unlockedReports
    });
};

export default function ReportsPage() {
    const { user, reports, totalReports, unlockedReports } = useLoaderData<LoaderData>();

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Sidebar user={user} />

            <main className="flex-1 md:ml-64 p-4 sm:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <FileText className="w-10 h-10 text-blue-600" />
                        My Reports
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Access all your AI-generated assessment reports in one place
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Total Reports</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{totalReports}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Unlocked</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{unlockedReports}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Locked</p>
                                <p className="text-3xl font-bold text-amber-600 mt-1">{totalReports - unlockedReports}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <Lock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Reports List */}
                {reports.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Available</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            Reports will appear here after you complete an assessment and your payment is verified by our admin team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/startTransformationDashboard"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Start Assessment
                            </Link>
                            <Link
                                to="/payment/checkout"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
                            >
                                <Lock className="w-4 h-4" />
                                View Payment Status
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all hover:shadow-xl ${report.isVerified ? 'border-green-200 hover:border-green-300' : 'border-amber-200 hover:border-amber-300'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">
                                                    {report.section}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.isPaid ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            Not Paid
                                                        </span>
                                                    )}

                                                    {report.isVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            Not Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(report.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Status: {report.status === 'approved' ? 'Ready' : 'Processing'}
                                                </span>
                                            </div>

                                            {!report.isVerified && (
                                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-sm text-amber-800">
                                                        <span className="font-semibold">🔒 Verification Required:</span> {report.isPaid ? 'Payment received! Waiting for admin verification.' : 'Complete payment verification to unlock this report'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            {report.isVerified ? (
                                                <Link
                                                    to={report.reportUrl}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View Report
                                                </Link>
                                            ) : (
                                                <Link
                                                    to="/payment/checkout"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    {report.isPaid ? <Clock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                    {report.isPaid ? 'Awaiting Verification' : 'Unlock Report'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                {reports.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help?</h3>
                        <p className="text-slate-700 mb-4">
                            If you have completed payment but your report is still locked, please contact support or check your payment status.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/receiptsDashboard"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                            >
                                View Receipts
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
