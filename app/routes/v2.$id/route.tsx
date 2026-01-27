import { LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { CoverPage } from "./cover_page";
import { DatabaseRecord } from "./schemas";
import { getCompanyProfile } from "~/models/company.model.server";
import { ExecutiveSummary } from "./executive_summary";
import { MaturityDimensionBreakdown } from "./maturity.dimensions.breakdown";
import { RoadmapTimeline } from "./recommendationRoadmap";
import { BenchmarkingAnalysis } from "./benchmark";
import { RiskAssessment } from "./risk.management";
import { Brain, ArrowLeft } from "lucide-react";

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
        const brand_name = company_info?.brand_name || company_info?.company_name

        return { data, brand_name };
    }
    catch (e) {
        console.error("Something unintended just happen\n", e)
        throw new Response("Un-intended error has occured", { status: 500 });
    }
}
interface LoaderReturn {
    data: DatabaseRecord,
    brand_name: string
}

export default function Report() {
    const loader_content = useLoaderData<LoaderReturn>();
    const data: DatabaseRecord = loader_content.data
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <motion.div
                    className="flex flex-col items-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-200 font-medium animate-pulse">Initializing Report Engine...</p>
                </motion.div>
            </div>
        )
    }

    if (!data) {
        return (
            <motion.div
                key="no-report-data"
                className="min-h-screen bg-[#0f172a] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="text-center bg-slate-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg max-w-md mx-4">
                    <h1 className="text-2xl font-semibold text-white mb-2">No Report Data Available</h1>
                    <p className="text-slate-400">Please complete your assessment first.</p>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
            {/* Global Styles */}
            <style>{`
            .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
            .neon-text { text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
        `}</style>

            {/* Ambient Lights */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-cyan-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Floating Header */}
            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }} transition={{ delay: 0.5, type: 'spring' }}
                className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/hrtek_logo.png" alt="HRTEK Logo" className="w-8 h-8 object-contain rounded-md shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-black text-xs tracking-tighter hidden sm:block">HRTEK</span>
                        </Link>
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <div>
                            <span className="block text-sm font-bold text-white">{loader_content.brand_name}</span>
                            <span className="block text-[10px] text-indigo-400 uppercase tracking-wider font-mono">Powered by HRTEK AI</span>
                        </div>
                    </div>
                    <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </motion.header>

            <main className="relative z-10 pt-16">
                <CoverPage metadata={data.result.assessment_metadata} orgName={loader_content.brand_name} />
                <ExecutiveSummary insights={data.result.strategic_insights} overallScore={data.result.maturity_analysis.overall_score} vizData={data.result.visualization_data} />
                <MaturityDimensionBreakdown heatmap={data.result.visualization_data.heat_map} progressBars={data.result.visualization_data.progress_bars} dimensionalScores={data.result.maturity_analysis.dimensional_scores} kpiFramework={data.result.success_metrics.kpi_framework} />
                <RoadmapTimeline recommendations={data.result.detailed_recommendations} />
                <BenchmarkingAnalysis dimensionalScores={data.result.maturity_analysis.dimensional_scores} overallScore={data.result.maturity_analysis.overall_score} radarData={data.result.visualization_data.radar_chart} />
                <RiskAssessment transformationRisks={data.result.risk_assessment.transformation_risks} />
            </main>
        </div>
    )

}