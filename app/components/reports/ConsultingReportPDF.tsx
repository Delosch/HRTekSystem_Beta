import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, Circle } from '@react-pdf/renderer';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#1e293b'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#4f46e5',
        paddingBottom: 20
    },
    brand: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 25,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4
    },
    subTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#334155',
        marginTop: 10,
        marginBottom: 4
    },
    text: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#475569',
        marginBottom: 4
    },
    summaryBox: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4
    },
    scoreLabel: {
        fontSize: 10,
        color: '#334155'
    },
    scoreValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4f46e5'
    },
    roadmapItem: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#cbd5e1'
    },
    bullet: {
        width: 10,
        fontSize: 10,
        color: '#4f46e5'
    }
});

interface ConsultingReportPDFProps {
    report: any; // Using the transformed report object from the loader
    brandName: string;
}

const ConsultingReportPDF: React.FC<ConsultingReportPDFProps> = ({ report, brandName }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{brandName}</Text>
                        <Text style={styles.brand}>Digital Maturity Transformation Report</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4f46e5' }}>{report.executive_summary.overall_maturity_index}</Text>
                        <Text style={{ fontSize: 8, color: '#94a3b8' }}>MATURITY INDEX</Text>
                    </View>
                </View>

                {/* Executive Summary */}
                <View style={styles.summaryBox}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Executive Summary</Text>
                    <Text style={styles.text}>
                        The organization is currently assessed as "{report.executive_summary.maturity_category}". {report.executive_summary.executive_recommendation}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>Key Observations:</Text>
                        {report.executive_summary.key_observations.map((obs: string, i: number) => (
                            <Text key={i} style={styles.text}>• {obs}</Text>
                        ))}
                    </View>
                </View>

                {/* Maturity Scorecard */}
                <View>
                    <Text style={styles.sectionTitle}>Maturity Scorecard</Text>
                    {report.maturity_scorecard.map((item: any, i: number) => (
                        <View key={i} style={styles.scoreRow}>
                            <Text style={styles.scoreLabel}>{item.dimension}</Text>
                            <Text style={styles.scoreValue}>{item.score}/100</Text>
                        </View>
                    ))}
                </View>

                {/* Critical Gaps & Recs - Just taking top 3 for PDF summary */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Strategic Priorities</Text>
                    {report.dimension_deep_dives.slice(0, 3).map((dim: any, i: number) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                            <Text style={styles.subTitle}>{dim.dimension}</Text>
                            <Text style={styles.text}>Gap: {dim.current_state[0]}</Text>
                            <Text style={styles.text}>Action: {dim.recommendations[0]}</Text>
                        </View>
                    ))}
                </View>

                {/* Roadmap */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Transformation Roadmap</Text>
                    {report.transformation_roadmap.map((phase: any, i: number) => (
                        <View key={i} style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4f46e5', marginBottom: 4 }}>
                                {phase.phase} ({phase.timeline})
                            </Text>
                            {phase.actions.map((action: string, j: number) => (
                                <View key={j} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.text}>{action}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#94a3b8' }}>
                    Generated by HR Tek Systems • Confidential Advisory Report
                </Text>
            </Page>
        </Document>
    );
};

export default ConsultingReportPDF;
