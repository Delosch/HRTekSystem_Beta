export interface DatabaseRecord {
    pk: string;
    sk: string;
    assessment_id: string;
    createdAt: string;
    result: AssessmentReport;
    section: string;
}

export interface AssessmentReport {
    assessment_metadata: MetaData;
    detailed_recommendations: DetailedRecommendations;
    industry_benchmarking: {
        capability_rankings: Array<{
            capability_rankings: string,
            improvement_urgency: string,
            industry_rank: string,
            score_gap_to_leaders: number
        }>,
        peer_analysis: {
            bottom_quartile_threshold: number,
            industry_average: number,
            similar_size_average: number,
            top_performers_average: number
        }
    }
    maturity_analysis: MaturityAnalysis;
    organization_profile: OrganizationProfile;
    risk_assessment: {
        transformation_risks: TransformationRisks[];
    };
    strategic_insights: StrategicInsights;
    success_metrics: SuccessMetrics
    visualization_data: VisualizationData;
    consulting_report: ConsultingReport;
}

export interface ConsultingReport {
    executive_summary: {
        overall_maturity_index: number;
        maturity_category: string;
        what_this_means: string[];
        executive_recommendation: string;
    };
    maturity_scorecard: Array<{
        dimension: string;
        score: number;
        max_score: number;
        risk_level: string;
    }>;
    radar_data: Array<{
        subject: string;
        A: number;
        fullMark: number;
    }>;
    gap_data: Array<{
        name: string;
        gap: number;
        impact: number;
    }>;
    dimension_deep_dives: Array<{
        dimension: string;
        score?: number;
        current_state: string[];
        business_impact?: string[];
        risk?: string[];
        recommendations: string[];
        strategic_outlook?: string;
    }>;
    business_risk_opportunity: {
        top_risks: Array<{ risk: string; impact: string }>;
        opportunity_areas: Array<{ opportunity: string; value: string }>;
    };
    transformation_priority_matrix: Array<{
        initiative: string;
        priority: string;
        impact: string;
        effort: string;
    }>;
    transformation_roadmap: Array<{
        phase: string;
        timeline: string;
        actions: string[];
    }>;
    investment_indication: Array<{
        area: string;
        effort: string;
        investment_band: string;
    }>;
}
export interface SuccessMetrics {
    kpi_framework: Array<{
        dimension: string;
        measurement_frequency: string;
        primary_kpis: string[];
        target_improvement: string;
    }>;
}
export interface VisualizationData {
    radar_chart: RadarChartData;
    progress_bars: ProgressBar[];
    heat_map: HeatMapData;
    gap_bubbles: BubbleData[];
    bar_chart: BarChartData;
    readiness_metrics?: ReadinessMetric[];
}

// visualization graphs schemas
export interface RadarChartData {
    colors: {
        current: string;
        benchmark: string;
        target: string;
    };
    current_scores: number[];
    industry_benchmarks: number[];
    labels: string[];
    target_scores: number[];
}
export interface ProgressBar {
    color_code: string;
    current_percentage: number;
    dimension: string;
    status: string;
    target_percentage: number;
}
export interface HeatMapData {
    colors: {
        min: string;
        mid: string;
        max: string;
    };
    dimensions: DimensionMatrix[];
}

export interface BubbleData {
    dimension: string;
    gap: number;
    importance: number;
    investment: number;
    timeline: number;
    status: string;
}

export interface BarChartData {
    answeredQuestions: number[],
    dimensions: string[],
    totalQuestions: number
}

export interface Capability {
    name: string;
    score: number;
    // color_intensity: number;
}

export interface DimensionMatrix {
    name: string;
    capabilities: Capability[];
}

// meta data
export interface MetaData {
    assessment_id: string;
    completion_date: string;
    total_questions: number;
    answered_questions: number;
    completion_percentage: number;
    processing_confidence: number;
}
// profile
export interface OrganizationProfile {
    company_size: string;
    industry_sector: string;
    annual_revenue: string;
    business_model: string[];
    current_digital_stage: number;
}

export interface StrategicInsights {
    overall_assessment: string;
    maturity_stage_description: string;
    competitive_position: string;
    transformation_readiness: {
        score: number;
        readiness_level: string;
        enabling_factors: string[];
        blocking_factors: string[];
    };
}

export interface DimensionalScore {
    dimension: string;
    raw_score: number;
    weighted_score: number;
    percentage: number;
    maturity_level: string;
    confidence_score: number;
    questions_analyzed: number;
    industry_benchmark: number;
    key_strengths: string[];
    critical_gaps: string[];
    gap_analysis: {
        gap_to_benchmark: number;
        gap_to_best_practice: number;
        improvement_potential: number;
    };
}

export interface MaturityAnalysis {
    overall_score: MaturityAnalysis_OverallScrore;
    dimensional_scores: DimensionalScore[];
}

export interface TransformationRisks {
    impact: string,
    mitigation_strategy: string,
    probability: string,
    risk_category: string,
    risk_description: string
}

export interface ReadinessMetric {
    label: string;
    score: number;
    status: string;
}

export interface MaturityAnalysis_OverallScrore {
    raw_score: number;
    weighted_score: number;
    percentage: number;
    maturity_level: string;
    confidence_score: number;
    industry_benchmark: {
        industry_average: number;
        percentile_ranking: number;
        top_quartile_threshold: number;
        peer_comparison: string;
    };
}

export interface Action {
    action: string;
    dimension: string;
    effort: 'Low' | 'Medium' | 'High';
    estimated_cost: string;
    impact: 'Low' | 'Medium' | 'High';
    success_metrics: string[];
}

export interface RecommendationGroup {
    actions: Action[];
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    timeline: string;
}
export interface DetailedRecommendations {
    immediate_actions: RecommendationGroup;
    short_term_initiatives: RecommendationGroup;
    // Add other recommendation groups as needed
    medium_term_initiatives?: RecommendationGroup;
    long_term_initiatives?: RecommendationGroup;
}