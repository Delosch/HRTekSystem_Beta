import { generateHTIAdvisory } from "./app/lib/hti.deepseek";
import type { HTIAggregatedInput } from "./app/models/hti.model";

/**
 * Test Script: Generate Sample HTI Advisory Report using DeepSeek
 * Run with: npx tsx generate-sample-report.ts
 */

async function generateSampleReport() {
    console.log("🚀 Starting Sample HTI Report Generation...\n");

    // Create sample aggregated data (simulating completed assessments)
    const sampleData: HTIAggregatedInput = {
        companyId: "sample-company-123",
        timestamp: new Date().toISOString(),
        completedEnginesCount: 5,
        totalEngines: 5,
        engines: {
            maturity: {
                engineName: "HR Technology Maturity Analysis",
                progress: 100,
                completedAt: "2024-12-20T10:30:00Z",
                scores: {
                    overall: 45,
                    technology: 40,
                    process: 50,
                    people: 45
                },
                aiAnalysis: {
                    maturityLevel: "Low-Medium",
                    keyFindings: [
                        "Legacy HRIS system limiting automation capabilities",
                        "Manual processes dominate core HR functions",
                        "Limited data analytics and reporting capabilities",
                        "HR team shows readiness for digital transformation"
                    ],
                    gaps: [
                        "No integrated talent management system",
                        "Payroll and benefits administration not automated",
                        "Employee self-service portal missing"
                    ]
                }
            },
            roadmap: {
                engineName: "HR Transformation Roadmap Generator",
                progress: 100,
                completedAt: "2024-12-21T14:15:00Z",
                scores: {
                    urgency: 75,
                    feasibility: 60,
                    impact: 80
                },
                aiAnalysis: {
                    priority: "High",
                    timeline: "18-24 months",
                    keyInitiatives: [
                        "Core HRIS replacement",
                        "Talent management system implementation",
                        "HR analytics platform deployment"
                    ],
                    dependencies: [
                        "Executive sponsorship required",
                        "Budget allocation needed",
                        "Change management program essential"
                    ]
                }
            },
            vendor: {
                engineName: "Cognitive HCM Vendor Fit",
                progress: 100,
                completedAt: "2024-12-22T09:45:00Z",
                scores: {
                    workday: 85,
                    successFactors: 70,
                    oracle: 65,
                    adp: 60
                },
                aiAnalysis: {
                    recommendation: "Workday",
                    rationale: [
                        "Best fit for mid-market company size",
                        "Strong talent management capabilities",
                        "Modern user experience",
                        "Scalable for future growth"
                    ],
                    concerns: [
                        "Higher implementation cost",
                        "Longer deployment timeline",
                        "Requires dedicated project team"
                    ]
                }
            },
            change: {
                engineName: "Intelligent Change Management",
                progress: 100,
                completedAt: "2024-12-23T11:20:00Z",
                scores: {
                    readiness: 55,
                    resistance: 40,
                    leadership: 70,
                    communication: 50
                },
                aiAnalysis: {
                    changeReadiness: "Medium",
                    risks: [
                        "Middle management resistance to new processes",
                        "Limited change management experience",
                        "Competing priorities may delay adoption"
                    ],
                    enablers: [
                        "Strong executive sponsorship",
                        "HR team enthusiasm for transformation",
                        "Previous successful IT projects"
                    ]
                }
            },
            sharedServices: {
                engineName: "Shared Service Designer",
                progress: 100,
                completedAt: "2024-12-24T08:00:00Z",
                scores: {
                    feasibility: 65,
                    savings: 70,
                    complexity: 60
                },
                aiAnalysis: {
                    recommendation: "Phased approach",
                    phase1: "Payroll and benefits administration",
                    phase2: "Recruitment and onboarding",
                    phase3: "Learning and development",
                    expectedSavings: "25-30% operational cost reduction",
                    timeline: "12-18 months for full implementation"
                }
            }
        }
    };

    try {
        console.log("📊 Sample Company Profile:");
        console.log("   - Company Size: Mid-market (500-2000 employees)");
        console.log("   - Industry: Technology/Services");
        console.log("   - Current State: Legacy systems, manual processes");
        console.log("   - Transformation Goal: Modern, integrated HR platform\n");

        console.log("🧠 Calling DeepSeek via AWS Bedrock...\n");

        const advisory = await generateHTIAdvisory(sampleData);

        console.log("\n" + "=".repeat(80));
        console.log("📄 GENERATED HTI ADVISORY REPORT");
        console.log("=".repeat(80) + "\n");

        console.log("EXECUTIVE SUMMARY:");
        console.log("-".repeat(80));
        console.log(advisory.executiveSummary);
        console.log("\n");

        console.log("CURRENT STATE ASSESSMENT:");
        console.log("-".repeat(80));
        console.log(`Maturity Level: ${advisory.currentState.maturityLevel}`);
        console.log(`Digital Readiness: ${advisory.currentState.digitalReadiness}`);
        console.log("\nKey Gaps:");
        advisory.currentState.keyGaps.forEach((gap, i) => console.log(`  ${i + 1}. ${gap}`));
        console.log("\nStrengths:");
        advisory.currentState.strengths.forEach((strength, i) => console.log(`  ${i + 1}. ${strength}`));
        console.log("\n");

        console.log("STRATEGIC RECOMMENDATIONS:");
        console.log("-".repeat(80));
        console.log("\n🎯 NOW (Next 3-6 months):");
        advisory.recommendations.now.forEach((action, i) => console.log(`  ${i + 1}. ${action}`));
        console.log("\n⏭️  NEXT (6-12 months):");
        advisory.recommendations.next.forEach((action, i) => console.log(`  ${i + 1}. ${action}`));
        console.log("\n🔮 LATER (12-24 months):");
        advisory.recommendations.later.forEach((action, i) => console.log(`  ${i + 1}. ${action}`));
        console.log("\n");

        console.log("RISK FLAGS:");
        console.log("-".repeat(80));
        advisory.riskFlags.forEach((risk, i) => {
            console.log(`\n${i + 1}. ⚠️  ${risk.risk}`);
            console.log(`   Mitigation: ${risk.mitigation}`);
        });
        console.log("\n");

        console.log("DEPENDENCIES:");
        console.log("-".repeat(80));
        advisory.dependencies.forEach((dep, i) => console.log(`  ${i + 1}. ${dep}`));
        console.log("\n");

        console.log("AVOID NOW:");
        console.log("-".repeat(80));
        advisory.avoidNow.forEach((avoid, i) => console.log(`  ${i + 1}. ${avoid}`));
        console.log("\n");

        if (advisory.successMetrics) {
            console.log("SUCCESS METRICS:");
            console.log("-".repeat(80));
            advisory.successMetrics.forEach((metric, i) => console.log(`  ${i + 1}. ${metric}`));
            console.log("\n");
        }

        console.log("=".repeat(80));
        console.log("✅ Sample HTI Advisory Report Generated Successfully!");
        console.log("=".repeat(80) + "\n");

        // Save to file
        const fs = await import('fs/promises');
        await fs.writeFile(
            'sample-hti-report.json',
            JSON.stringify(advisory, null, 2),
            'utf-8'
        );
        console.log("💾 Report saved to: sample-hti-report.json\n");

    } catch (error) {
        console.error("\n❌ Error generating sample report:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        process.exit(1);
    }
}

// Run the generator
generateSampleReport()
    .then(() => {
        console.log("✅ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
