import { LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis";
import { CoverPage } from "./cover_page";
import { DatabaseRecord } from "./schemas";
import { getCompanyProfile } from "~/models/company.model";
import { ExecutiveSummary } from "./executive_summary";
import { MaturityDimensionBreakdown } from "./maturity.dimensions.breakdown";
import { RoadmapTimeline } from "./recommendationRoadmap";
import { BenchmarkingAnalysis } from "./benchmark";
import { RiskAssessment } from "./risk.management";


export const loader: LoaderFunction = async ({ request, params }: { request: Request, params: Params }) => {
    try {
        const user = await requireUserSession(request);
        if(!user || !user.organisationId){
            return null
        }
        if (!params.id) {
            throw new Response("Method Not Allowed", { status: 404 })
        }
        if (params.id && params.id === "Profiling Assessment") {
            const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, params.id);
            if (!data) {
                throw new Response("No assessment data found", { status: 404 });
            }
            const company_info = await getCompanyProfile(user.organisationId)

            const brand_name=company_info?.brand_name || company_info?.company_name
            console.log("brand name",brand_name)
            console.log(params)
            return { data, brand_name };

        }
        throw new Response("un excepted behaviour report the admin", { status: 502 })
    }
    catch (e) {
        console.error("Something unintended just happen\n", e)
        throw new Response("Un-intended error has occured", { status: 500 });
    }
}
interface LoaderReturn{
    data:DatabaseRecord,
    brand_name:string
}
export default function Report() {
    const loader_content = useLoaderData<LoaderReturn>();
    const data :DatabaseRecord = loader_content.data 
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <motion.div
                    className="flex flex-col items-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin">
                    </div>
                    <p className="text-gray-600 font-medium">Loading Your Report ...</p>
                </motion.div>
            </div>
        )
    }

    if (!data) {
        return (

            <motion.div
                key="no-report-data" // Add unique key
                className="min-h-screen bg-gray-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} // Add exit animation
                transition={{ duration: 0.3 }} // Add transition timing
            >
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">No Report Data Available</h1>
                    <p className="text-gray-600">Please complete your assessment first.</p>
                </div>
            </motion.div>
        )
    }

    return (
    <main className="font-sans bg-white">
        <CoverPage metadata = {data.result.assessment_metadata} orgName={loader_content.brand_name}/>
        <ExecutiveSummary insights={data.result.strategic_insights} overallScore={data.result.maturity_analysis.overall_score} vizData={data.result.visualization_data}/>
        <MaturityDimensionBreakdown heatmap={data.result.visualization_data.heat_map} progressBars={data.result.visualization_data.progress_bars} dimensionalScores={data.result.maturity_analysis.dimensional_scores} kpiFramework={data.result.success_metrics.kpi_framework}/>
        <RoadmapTimeline  recommendations={data.result.detailed_recommendations}/>
        <BenchmarkingAnalysis dimensionalScores={data.result.maturity_analysis.dimensional_scores} overallScore={data.result.maturity_analysis.overall_score} radarData ={data.result.visualization_data.radar_chart}/>
        <RiskAssessment transformationRisks={data.result.risk_assessment.transformation_risks}/>
    </main>
    )

}