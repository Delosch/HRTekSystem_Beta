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
        pageBreakInside: 'avoid',
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
        color: '#4b5563',
        lineHeight: 1.6,
        marginBottom: 4,
    },
    bulletPoint: {
        fontSize: 9,
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
        display: 'inline-block',
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
}

/**
 * Strip HTML tags and create concise summary
 */
function createPDFSummary(html: string): string {
    // Add line breaks for block elements
    let text = html.replace(/<\/?( div|p|h1|h2|h3|h4|h5|h6|table|tr|thead|tbody|br)[^>]*>/gi, '\n');
    // Remove all HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    // Clean up whitespace
    text = text.replace(/ +/g, ' ');
    text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join(' ');

    // Take first 500 characters for concise summary
    if (text.length > 500) {
        text = text.substring(0, 500);
        const lastPeriod = text.lastIndexOf('.');
        if (lastPeriod > 300) {
            text = text.substring(0, lastPeriod + 1);
        } else {
            text = text + '...';
        }
    }

    return text.trim();
}

export const HTIReportPDF: React.FC<HTIReportPDFProps> = ({ report }) => {
    const { advisory, companyId, generatedAt } = report;
    const conciseSummary = createPDFSummary(advisory.executiveSummary);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                <Text style={styles.watermark}>HRTekSystem</Text>

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View>
                            <Text style={styles.title}>HTI Advisory Report</Text>
                            <Text style={styles.subtitle}>HR Transformation Intelligence</Text>
                        </View>
                        <Image src="https://hrteksystem.com/logo_icon_final.png" style={{ width: 40, height: 40 }} />
                    </View>
                    <Text style={[styles.subtitle, { marginTop: 6 }]}>
                        Company ID: {companyId} • Generated: {new Date(generatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                {/* Executive Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Executive Summary</Text>
                    <Text style={styles.text}>{conciseSummary}</Text>
                </View>

                {/* Current State - Compact */}
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

                    {advisory.currentState.keyGaps.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={styles.subsectionTitle}>Key Gaps</Text>
                            {advisory.currentState.keyGaps.slice(0, 5).map((gap, i) => (
                                <Text key={i} style={styles.bulletPoint}>• {gap}</Text>
                            ))}
                        </View>
                    )}

                    {advisory.currentState.strengths.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={styles.subsectionTitle}>Strengths</Text>
                            {advisory.currentState.strengths.slice(0, 5).map((strength, i) => (
                                <Text key={i} style={styles.bulletPoint}>• {strength}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recommendations - Structured */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Strategic Recommendations</Text>

                    <View style={styles.recommendationBox}>
                        <Text style={styles.recommendationTitle}>NOW (3-6 months)</Text>
                        {advisory.recommendations.now.slice(0, 4).map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>

                    <View style={[styles.recommendationBox, { backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' }]}>
                        <Text style={[styles.recommendationTitle, { color: '#92400e' }]}>NEXT (6-12 months)</Text>
                        {advisory.recommendations.next.slice(0, 3).map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>

                    <View style={[styles.recommendationBox, { backgroundColor: '#f0fdf4', borderLeftColor: '#10b981' }]}>
                        <Text style={[styles.recommendationTitle, { color: '#065f46' }]}>LATER (12-24 months)</Text>
                        {advisory.recommendations.later.slice(0, 3).map((item, i) => (
                            <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                        ))}
                    </View>
                </View>

                {/* Risk Flags */}
                {advisory.riskFlags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚠️ Risk Flags</Text>
                        {advisory.riskFlags.slice(0, 3).map((risk, i) => (
                            <View key={i} style={styles.riskBox}>
                                <Text style={styles.riskTitle}>{risk.risk}</Text>
                                <Text style={[styles.text, { fontSize: 8 }]}>
                                    <Text style={{ fontWeight: 'bold' }}>Mitigation: </Text>
                                    {risk.mitigation}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Dependencies & Actions to Avoid - Side by Side */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    {advisory.dependencies.length > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.subsectionTitle}>🔗 Dependencies</Text>
                            {advisory.dependencies.slice(0, 3).map((dep, i) => (
                                <Text key={i} style={[styles.bulletPoint, { fontSize: 8 }]}>• {dep}</Text>
                            ))}
                        </View>
                    )}

                    {advisory.avoidNow.length > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.subsectionTitle}>🚫 Avoid Now</Text>
                            {advisory.avoidNow.slice(0, 3).map((item, i) => (
                                <Text key={i} style={[styles.bulletPoint, { fontSize: 8 }]}>• {item}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Success Metrics */}
                {advisory.successMetrics && advisory.successMetrics.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.subsectionTitle}>📈 Success Metrics</Text>
                        {advisory.successMetrics.slice(0, 4).map((metric, i) => (
                            <Text key={i} style={[styles.bulletPoint, { fontSize: 8 }]}>• {metric}</Text>
                        ))}
                    </View>
                )}

                {/* Terms and Conditions */}
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

                    <View style={{ marginBottom: 6 }}>
                        <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginBottom: 2 }]}>
                            4. Validity and Updates
                        </Text>
                        <Text style={[styles.text, { fontSize: 7, lineHeight: 1.4 }]}>
                            This advisory is valid as of the generation date specified in this document. Business conditions, technology landscapes, and organizational contexts may change. HRTekSystem recommends periodic reassessment to ensure recommendations remain relevant.
                        </Text>
                    </View>

                    <View style={{ marginBottom: 6 }}>
                        <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginBottom: 2 }]}>
                            5. Intellectual Property
                        </Text>
                        <Text style={[styles.text, { fontSize: 7, lineHeight: 1.4 }]}>
                            All methodologies, frameworks, and analytical approaches used in generating this report are proprietary to HRTekSystem. The client organization may use this report for internal strategic planning but may not reproduce or share the methodologies without written permission.
                        </Text>
                    </View>

                    <Text style={[styles.text, { fontSize: 7, fontStyle: 'italic', marginTop: 4, textAlign: 'center', color: '#64748b' }]}>
                        By using this report, you acknowledge and agree to these terms and conditions.
                    </Text>

                    <Text style={[styles.text, { fontSize: 7, fontWeight: 'bold', marginTop: 6, textAlign: 'center', color: '#1e40af' }]}>
                        Generated by HRTekSystem - HR Transformation Intelligence Platform
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    © {new Date().getFullYear()} HRTekSystem • Confidential Advisory Report • All Rights Reserved
                </Text>
            </Page>
        </Document>
    );
};
