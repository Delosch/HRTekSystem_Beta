import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font (optional, using standard fonts for now)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Fallback to standard
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 5
    },
    section: {
        margin: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        backgroundColor: '#f1f5f9',
        padding: 5,
        marginBottom: 10
    },
    text: {
        fontSize: 10,
        marginBottom: 5,
        lineHeight: 1.5,
        color: '#334155'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    col: {
        flex: 1,
        padding: 5
    },
    card: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    }
});

interface HTIReportPDFProps {
    report: any; // Using any for now to match the implicit type in current code
}

const HTIReportPDF: React.FC<HTIReportPDFProps> = ({ report }) => {
    const { advisory, generatedAt } = report;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Digital Maturity Assessment Report</Text>
                    <Text style={styles.subtitle}>Generated on: {new Date(generatedAt).toLocaleDateString()}</Text>
                    <Text style={styles.subtitle}>Assessment ID: {report.reportId}</Text>
                </View>

                {/* Executive Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Executive Summary</Text>
                    <Text style={styles.text}>{advisory.executiveSummary}</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <View style={styles.card}>
                                <Text style={{ fontSize: 8, color: '#64748b' }}>Maturity Level</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{advisory.currentState.maturityLevel}</Text>
                            </View>
                        </View>
                        <View style={styles.col}>
                            <View style={styles.card}>
                                <Text style={{ fontSize: 8, color: '#64748b' }}>Readiness</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{advisory.currentState.digitalReadiness}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Key Gaps & Strengths */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Critical Gaps</Text>
                            {advisory.currentState.keyGaps?.map((gap: string, i: number) => (
                                <Text key={i} style={styles.text}>• {gap}</Text>
                            ))}
                        </View>
                        <View style={styles.col}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Key Strengths</Text>
                            {advisory.currentState.strengths?.map((str: string, i: number) => (
                                <Text key={i} style={styles.text}>• {str}</Text>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Recommendations */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>Strategic Recommendations</Text>

                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, color: '#dc2626' }}>Immediate Actions (0-3 Months)</Text>
                    {advisory.recommendations.now?.map((rec: string, i: number) => (
                        <Text key={i} style={styles.text}>• {rec}</Text>
                    ))}

                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, color: '#d97706' }}>Next Steps (3-12 Months)</Text>
                    {advisory.recommendations.next?.map((rec: string, i: number) => (
                        <Text key={i} style={styles.text}>• {rec}</Text>
                    ))}
                </View>

                {/* Footer */}
                <Text style={{ position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, textAlign: 'center', color: '#94a3b8' }}>
                    Powered by Delosh Intelligence • Confidential & Proprietary
                </Text>
            </Page>
        </Document>
    );
};

export default HTIReportPDF;
