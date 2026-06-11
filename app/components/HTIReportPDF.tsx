import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF Styles - Professional & Clean
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 50,
        color: '#f5f5f5',
        opacity: 0.2,
    },
    header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: '3 solid #2563eb',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: '1 solid #e5e7eb',
    },
    subsectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 8,
        marginBottom: 4,
    },
    text: {
        fontSize: 9,
        fontWeight: 'normal',
        color: '#4b5563',
        lineHeight: 1.6,
        marginBottom: 4,
    },
    bulletPoint: {
        fontSize: 9,
        fontWeight: 'normal',
        color: '#4b5563',
        marginLeft: 12,
        marginBottom: 3,
        lineHeight: 1.5,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    gridItem: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        border: '1 solid #e2e8f0',
    },
    gridLabel: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 3,
    },
    gridValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    recommendationBox: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f9ff',
        borderLeft: '3 solid #3b82f6',
        borderRadius: 2,
    },
    recommendationTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 6,
    },
    riskBox: {
        padding: 10,
        backgroundColor: '#fef2f2',
        borderLeft: '3 solid #ef4444',
        marginBottom: 8,
        borderRadius: 2,
    },
    riskTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#991b1b',
        marginBottom: 3,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        fontSize: 7,
        color: '#9ca3af',
        textAlign: 'center',
        paddingTop: 8,
        borderTop: '1 solid #e5e7eb',
    },
    badge: {
        padding: '3 8',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        fontSize: 8,
        fontWeight: 'bold',
        borderRadius: 3,
        marginRight: 6,
    },
});

interface HTIReportPDFProps {
    report: {
        companyId: string;
        generatedAt: string;
        advisory: {
            executiveSummary: string;
            detailedSections?: Array<{
                title: string;
                content: string;
            }>;
            currentState: {
                maturityLevel?: string;
                digitalReadiness?: string;
                keyGaps: string[];
                strengths: string[];
            };
            recommendations: {
                now: string[];
                next: string[];
                later: string[];
            };
            riskFlags: Array<{
                risk: string;
                mitigation: string;
            }>;
            dependencies: string[];
            avoidNow: string[];
            successMetrics?: string[];
        };
    };
    brandName?: string;
}

/**
 * Strip HTML tags for simple text rendering
 */
function stripHTML(html: string): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

/**
 * A basic component to render HTML-like strings from DeepSeek into React-PDF components.
 * Supports: h2, h3, p, ul, li, table, tr, td, th
 */
const HTMLRenderer = ({ html }: { html: string }) => {
    if (!html) return null;

    // Split by tags to identify blocks
    // This is a naive parser for the specific tags DeepSeek uses
    const blocks = html.split(/(<\/?(?:h2|h3|h4|p|ul|li|table|tr|td|th|div)[^>]*>)/gi);
    
    let currentTag = "";
    let listDepth = 0;
    
    return (
        <View style={{ marginTop: 10 }}>
            {blocks.map((block, i) => {
                const tagMatch = block.match(/<(\/?)(\w+)[^>]*>/);
                
                if (tagMatch) {
                    const isClosing = tagMatch[1] === "/";
                    const tagName = tagMatch[2].toLowerCase();
                    
                    if (isClosing) {
                        if (tagName === "ul") listDepth--;
                        currentTag = "";
                    } else {
                        currentTag = tagName;
                        if (tagName === "ul") listDepth++;
                    }
                    return null;
                }

                const text = block.trim();
                if (!text) return null;

                // Render based on current open tag (or last seen tag)
                // Note: This is simplified; true nested tag parsing would require a stack
                if (block.includes("<h2")) return <Text key={i} style={[styles.sectionTitle, { marginTop: 20 }]}>{stripHTML(text)}</Text>;
                if (block.includes("<h3")) return <Text key={i} style={[styles.subsectionTitle, { marginTop: 15 }]}>{stripHTML(text)}</Text>;
                if (block.includes("<li")) return <Text key={i} style={styles.bulletPoint}>• {stripHTML(text)}</Text>;
                
                // Default paragraph
                return <Text key={i} style={styles.text}>{stripHTML(text)}</Text>;
            })}
        </View>
    );
};

export const HTIReportPDF: React.FC<HTIReportPDFProps> = ({ report, brandName }) => {
    const { advisory, companyId, generatedAt } = report;

    return (
        <Document>
            {/* Page 1: Executive Summary */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.watermark}>HRTekSystem</Text>

                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View>
                            <Text style={styles.title}>HTI Advisory Report</Text>
                            <Text style={styles.subtitle}>HR Transformation Intelligence</Text>
                        </View>
                        <Image src="https://www.hrteksystem.com/logo_icon_final.png" style={{ width: 40, height: 40 }} />
                    </View>
                    <Text style={[styles.subtitle, { marginTop: 6 }]}>
                        Company ID: {companyId} • Generated: {new Date(generatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Executive Summary</Text>
                    {/* Render the full summary, splitting by paragraphs if needed */}
                    {advisory.executiveSummary.split('</p>').map((p, i) => (
                        <Text key={i} style={[styles.text, { marginBottom: 10 }]}>{stripHTML(p)}</Text>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Current State Assessment</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Maturity Level</Text>
                            <Text style={styles.gridValue}>{advisory.currentState.maturityLevel || 'N/A'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Digital Readiness</Text>
                            <Text style={styles.gridValue}>{advisory.currentState.digitalReadiness || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Page 1 • © {new Date().getFullYear()} HRTekSystem • Confidential Advisory Report
                </Text>
            </Page>

            {/* Detailed Sections - Each on its own page or continuing */}
            {advisory.detailedSections?.map((section, index) => (
                <Page key={index} size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.subtitle, { fontSize: 8 }]}>HTI ADVISORY • CHAPTER {index + 1}</Text>
                        <Text style={[styles.sectionTitle, { borderBottom: '2 solid #2563eb', paddingBottom: 5 }]}>{section.title}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <HTMLRenderer html={section.content} />
                    </View>

                    <Text style={styles.footer}>
                        Page {index + 2} • {brandName || "Strategic Advisory"} • HRTek Intelligence
                    </Text>
                </Page>
            ))}

            {/* Recommendations & Risks Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Strategic Roadmap Recommendations</Text>
                    <View style={styles.recommendationBox}>
                        <Text style={styles.recommendationTitle}>PHASE 1: NOW (3-6 months)</Text>
                        {advisory.recommendations.now.map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>
                    <View style={[styles.recommendationBox, { backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' }]}>
                        <Text style={[styles.recommendationTitle, { color: '#92400e' }]}>PHASE 2: NEXT (6-12 months)</Text>
                        {advisory.recommendations.next.map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>
                    <View style={[styles.recommendationBox, { backgroundColor: '#f0fdf4', borderLeftColor: '#10b981' }]}>
                        <Text style={[styles.recommendationTitle, { color: '#065f46' }]}>PHASE 3: BEYOND (12-24 months)</Text>
                        {advisory.recommendations.later.map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>
                </View>

                {advisory.riskFlags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚠️ Critical Risk Vectors</Text>
                        {advisory.riskFlags.map((risk, i) => (
                            <View key={i} style={styles.riskBox}>
                                <Text style={styles.riskTitle}>{risk.risk}</Text>
                                <Text style={styles.text}>{risk.mitigation}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.footer}>
                    Strategic Implementation Framework • HRTek Intelligence
                </Text>
            </Page>

            {/* Terms and Conditions Page */}
            <Page size="A4" style={styles.page}>
                 <View style={{
                    marginTop: 20,
                    paddingTop: 12,
                    borderTop: '2 solid #e5e7eb',
                    marginBottom: 30
                }}>
                    <Text style={[styles.sectionTitle, { fontSize: 11, marginBottom: 6 }]}>
                        Terms and Conditions
                    </Text>

                    <View style={{ marginBottom: 6 }}>
                        <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginBottom: 2 }]}>
                            1. Confidentiality and Proprietary Information
                        </Text>
                        <Text style={[styles.text, { fontSize: 7, lineHeight: 1.4 }]}>
                            This HTI Advisory Report is confidential and proprietary to HRTekSystem. It contains sensitive business intelligence and strategic recommendations prepared exclusively for the named organization. Unauthorized disclosure, reproduction, or distribution is strictly prohibited.
                        </Text>
                    </View>

                    <View style={{ marginBottom: 6 }}>
                        <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginBottom: 2 }]}>
                            2. Advisory Nature
                        </Text>
                        <Text style={[styles.text, { fontSize: 7, lineHeight: 1.4 }]}>
                            This report provides strategic advisory and recommendations based on assessment data provided by the client organization. HRTekSystem does not guarantee specific outcomes or results from implementing these recommendations. All strategic decisions remain the responsibility of the client organization.
                        </Text>
                    </View>

                    <View style={{ marginBottom: 6 }}>
                        <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginBottom: 2 }]}>
                            3. Data Accuracy and Liability
                        </Text>
                        <Text style={[styles.text, { fontSize: 7, lineHeight: 1.4 }]}>
                            Recommendations are based on information provided during the assessment process. HRTekSystem is not liable for decisions made based on this advisory. The client organization should conduct additional due diligence before implementing major transformation initiatives.
                        </Text>
                    </View>

                    <Text style={[styles.text, { fontSize: 7, fontStyle: 'italic', marginTop: 4, textAlign: 'center', color: '#64748b' }]}>
                        By using this report, you acknowledge and agree to these terms and conditions.
                    </Text>

                    <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginTop: 6, textAlign: 'center', color: '#1e40af' }]}>
                        Generated by HRTekSystem - HR Transformation Intelligence Platform
                    </Text>
                </View>

                <Text style={styles.footer}>
                    Final Page • © {new Date().getFullYear()} HRTekSystem • All Rights Reserved
                </Text>
            </Page>
        </Document>
    );
};
