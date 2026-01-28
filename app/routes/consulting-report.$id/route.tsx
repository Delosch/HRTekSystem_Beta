import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Params, useLoaderData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { DatabaseRecord } from "../v2.$id/schemas";
import { Clock, ArrowLeft, Brain } from "lucide-react";
import { getCompanyPayments } from "~/models/payment.model.server";
import { getEnginePriceByName } from "~/lib/pricing";
import { addOrUpdateCartItem } from "~/models/cart.model.server";

import ChangeManagementReport from "~/components/reports/ChangeManagementReport";
import RoadmapReport from "~/components/reports/RoadmapReport";
import SharedServicesReport from "~/components/reports/SharedServicesReport";
import VendorFitReportDashboard from "~/components/reports/VendorFitReportDashboard";
import TechMaturityReport from "~/components/reports/TechMaturityReport";
import DigitalMaturityReport from "~/components/reports/DigitalMaturityReport";

// --- Loader ---
export const loader: LoaderFunction = async ({ request, params }: { request: Request, params: Params }) => {
    try {
        const user = await requireUserSession(request);
        if (!user || !user.organisationId) return redirect('/auth');
        if (!params.id) throw new Response("Assessment ID Required", { status: 404 });

        console.log(`[Consulting Report Loader] User: ${user.organisationId}, Engine: ${params.id}`);

        const allPayments = await getCompanyPayments(user.organisationId);
        const payment = allPayments.find(p => p.items?.some((i: any) => i.engineName === params.id));

        const isPaid = payment?.status === "payment_verified";
        const isPending = payment?.status === "payment_submitted";
        const isAdmin = (user as any).role === "ADMIN";

        console.log(`[Consulting Report Loader] Payment Status - isPaid: ${isPaid}, isPending: ${isPending}, isAdmin: ${isAdmin}`);

        if (!isPaid && !isAdmin) {
            if (isPending) {
                return json({ paymentStatus: "pending" });
            }

            // Redirect to payment: Add to cart first then checkout
            const price = getEnginePriceByName(params.id);
            await addOrUpdateCartItem({
                companyId: user.organisationId,
                productName: params.id,
                price: price,
                userId: user.userId,
            });
            return redirect('/payment/checkout');
        }

        // FIX: Don't add COMPANY# prefix - getLatestAnalysis already does this
        const data = await getLatestAnalysis(user.organisationId, params.id);

        console.log(`[Consulting Report Loader] Data found: ${!!data}`);

        if (!data) {
            console.error(`[Consulting Report Loader] No assessment data found for ${params.id}`);
            throw new Response("No assessment data found", { status: 404 });
        }

        const company_info = await getCompanyProfile(user.organisationId);
        const brand_name = company_info?.brand_name || company_info?.company_name || "Confidential Client";

        // Check URL for report type (detailed vs standard)
        const url = new URL(request.url);
        const reportType = url.searchParams.get('type') as 'detailed' | 'standard' || 'detailed';

        return json({
            data,
            brand_name,
            assessmentId: params.id || "Unknown Assessment",
            reportType
        });
    } catch (e) {
        console.error("REPORT_LOADER_ERROR:", e);
        // Provide more context in the error response if possible
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        throw new Response(`Internal Server Error: ${errorMessage}`, { status: 500 });
    }
}

interface LoaderReturn {
    data?: DatabaseRecord,
    brand_name?: string,
    assessmentId?: string,
    paymentStatus?: string,
    reportType?: 'detailed' | 'standard'
}

// --- Main Component ---

export default function ConsultingReport() {
    const loaderData = useLoaderData<LoaderReturn>();

    if (loaderData.paymentStatus === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg text-center border border-gray-100">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Pending</h1>
                    <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                        Your payment has been submitted and is currently being verified by our administrators.
                        This usually takes less than 24 hours. You will be notified once the report is unlocked.
                    </p>
                    <a href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Return to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    const { data, brand_name, assessmentId } = loaderData;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Use dashboard-style reports for specific engines
    if (assessmentId === "Intelligent Change Management") {
        return <ChangeManagementReport data={data} brandName={brand_name || "Your Organization"} assessmentId={assessmentId} />;
    }
    if (assessmentId === "HR Transformation Roadmap Generator") {
        return <RoadmapReport data={data} brandName={brand_name || "Your Organization"} />;
    }
    if (assessmentId === "Shared Service Designer") {
        return <SharedServicesReport data={data} brandName={brand_name || "Your Organization"} />;
    }
    if (assessmentId === "HCM Vendor Fit Engine") {
        return <VendorFitReportDashboard data={data} brandName={brand_name || "Your Organization"} />;
    }
    if (assessmentId === "HR Technology Maturity Analysis" || assessmentId === "HR Tech Maturity Analysis") {
        return <TechMaturityReport data={data} brandName={brand_name || "Your Organization"} />;
    }

    // Default to Digital Maturity Report (Figma Design)
    return <DigitalMaturityReport data={data} brandName={brand_name || "Your Organization"} assessmentId={assessmentId} reportType={loaderData.reportType} />;
}