import { Response, IndexScore, CompositeScore, SectionScore } from '../types/assessment';
import { assessmentSections } from '../data/assessmentData';

// Index weights (each 20% of total 100 points)
const INDEX_WEIGHTS = {
    SFRI: 0.20, // Strategic & Financial Readiness Index
    LGI: 0.20,  // Leadership & Governance Index
    OCRI: 0.20, // Organizational & Cultural Readiness Index
    DWRI: 0.20, // Digital & Workforce Readiness Index
    ASII: 0.20  // Adoption & Sustainability Intelligence Index
};

export function calculateSectionScore(sectionId: string, responses: Response): SectionScore {
    const section = assessmentSections.find(s => s.id === sectionId);
    if (!section) {
        return { sectionId, score: 0, maxScore: 0, percentage: 0, status: 'red' };
    }

    let totalScore = 0;
    let totalWeight = 0;
    let answeredQuestions = 0;

    section.questions.forEach(question => {
        const response = responses[question.id];
        if (response !== undefined) {
            const weight = question.weight || 1;
            totalScore += response * weight;
            totalWeight += 4 * weight; // Max score is 4
            answeredQuestions++;
        }
    });

    const maxScore = totalWeight;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    let status: 'green' | 'amber' | 'red';
    if (percentage >= 70) status = 'green';
    else if (percentage >= 50) status = 'amber';
    else status = 'red';

    return {
        sectionId,
        score: totalScore,
        maxScore,
        percentage,
        status
    };
}

export function calculateIndexScores(responses: Response): IndexScore[] {
    // Group sections by index
    const indexGroups: { [key: string]: typeof assessmentSections } = {
        SFRI: [],
        LGI: [],
        OCRI: [],
        DWRI: [],
        ASII: []
    };

    assessmentSections.forEach(section => {
        if (indexGroups[section.indexMapping]) {
            indexGroups[section.indexMapping].push(section);
        }
    });

    const indices: IndexScore[] = [];

    // Calculate each index
    Object.entries(indexGroups).forEach(([indexKey, sections]) => {
        let totalScore = 0;
        let totalMaxScore = 0;

        sections.forEach(section => {
            const sectionScore = calculateSectionScore(section.id, responses);
            totalScore += sectionScore.score;
            totalMaxScore += sectionScore.maxScore;
        });

        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        const scaledScore = (percentage / 100) * 20; // Scale to 20 points

        // Apply special rules
        let finalScore = scaledScore;

        // Red Flag Rule for Leadership Index
        if (indexKey === 'LGI') {
            const executiveSponsorResponse = responses['s2-q1'];
            if (executiveSponsorResponse !== undefined && executiveSponsorResponse <= 1) {
                finalScore = Math.min(finalScore, 10); // Cap at 10/20
            }
        }

        // Risk Multiplier Rule for OCRI
        if (indexKey === 'OCRI') {
            const changeSaturationResponse = responses['s3-q1'];
            if (changeSaturationResponse !== undefined && changeSaturationResponse === 0) {
                finalScore = finalScore * 0.85; // Reduce by 15%
            }
        }

        // Automation Stress Logic for DWRI
        if (indexKey === 'DWRI') {
            const automationResponse = responses['s5-q2'];
            if (automationResponse !== undefined && automationResponse <= 1) {
                finalScore = Math.max(0, finalScore - 5);
            }
        }

        // Smart Boost Logic for ASII
        if (indexKey === 'ASII') {
            const adoptionTracking = responses['s10-q1'];
            const reinforcement = responses['s11-q1'];
            if (adoptionTracking === 4 && reinforcement >= 3) {
                finalScore = Math.min(20, finalScore + 2);
            }
        }

        let status: 'green' | 'amber' | 'red';
        if (percentage >= 70) status = 'green';
        else if (percentage >= 50) status = 'amber';
        else status = 'red';

        const indexNames: { [key: string]: string } = {
            SFRI: 'Strategic & Financial Readiness',
            LGI: 'Leadership & Governance',
            OCRI: 'Organizational & Cultural Readiness',
            DWRI: 'Digital & Workforce Readiness',
            ASII: 'Adoption & Sustainability Intelligence'
        };

        const indexDescriptions: { [key: string]: string } = {
            SFRI: 'Business case strength, ROI clarity, and financial planning',
            LGI: 'Executive sponsorship, governance maturity, and leadership commitment',
            OCRI: 'Change capacity, cultural adaptability, and stakeholder management',
            DWRI: 'Digital fluency, process readiness, and technology alignment',
            ASII: 'Communication, learning, measurement, and reinforcement strategies'
        };

        indices.push({
            name: indexNames[indexKey],
            score: finalScore,
            maxScore: 20,
            percentage,
            status,
            description: indexDescriptions[indexKey]
        });
    });

    return indices;
}

export function calculateCompositeScore(responses: Response): CompositeScore {
    const indices = calculateIndexScores(responses);

    // Overall Score (sum of all indices)
    const overall = indices.reduce((sum, index) => sum + index.score, 0);

    // Determine category and interpretation
    let category = '';
    let interpretation = '';

    if (overall >= 85) {
        category = 'Transformation-Ready Enterprise';
        interpretation = 'High Probability of Success';
    } else if (overall >= 70) {
        category = 'Structured but Risk-Aware';
        interpretation = 'Guided Execution Needed';
    } else if (overall >= 50) {
        category = 'Moderate Risk Zone';
        interpretation = 'Strategic Intervention Required';
    } else if (overall >= 30) {
        category = 'High Risk';
        interpretation = 'Significant Change Gaps';
    } else {
        category = 'Critical Failure Risk';
        interpretation = 'Transformation Not Feasible Yet';
    }

    // Transformation Risk Index
    const transformationRiskIndex = 100 - overall;

    // Adoption Probability Index (API)
    const lgiIndex = indices.find(i => i.name === 'Leadership & Governance');
    const ocriIndex = indices.find(i => i.name === 'Organizational & Cultural Readiness');
    const dwriIndex = indices.find(i => i.name === 'Digital & Workforce Readiness');
    const asiiIndex = indices.find(i => i.name === 'Adoption & Sustainability Intelligence');

    const adoptionProbabilityIndex =
        (lgiIndex ? lgiIndex.score : 0) * 0.3 +
        (ocriIndex ? ocriIndex.score : 0) * 0.3 +
        (dwriIndex ? dwriIndex.score : 0) * 0.2 +
        (asiiIndex ? asiiIndex.score : 0) * 0.2;

    // Financial Feasibility Score (FFS)
    const sfriIndex = indices.find(i => i.name === 'Strategic & Financial Readiness');
    const financialFeasibilityScore = sfriIndex ? (sfriIndex.score / 20) * 100 : 0;

    return {
        overall,
        category,
        interpretation,
        transformationRiskIndex,
        adoptionProbabilityIndex: (adoptionProbabilityIndex / 20) * 100,
        financialFeasibilityScore
    };
}

export function getCompletionPercentage(responses: Response): number {
    const totalQuestions = assessmentSections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return totalQuestions > 0 ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100)) : 0;
}

export function getStatusColor(status: 'green' | 'amber' | 'red'): string {
    switch (status) {
        case 'green': return 'text-green-600';
        case 'amber': return 'text-amber-600';
        case 'red': return 'text-red-600';
        default: return 'text-gray-600';
    }
}

export function getStatusBgColor(status: 'green' | 'amber' | 'red'): string {
    switch (status) {
        case 'green': return 'bg-green-100';
        case 'amber': return 'bg-amber-100';
        case 'red': return 'bg-red-100';
        default: return 'bg-gray-100';
    }
}

export function getStatusBorderColor(status: 'green' | 'amber' | 'red'): string {
    switch (status) {
        case 'green': return 'border-green-500';
        case 'amber': return 'border-amber-500';
        case 'red': return 'border-red-500';
        default: return 'border-gray-500';
    }
}
