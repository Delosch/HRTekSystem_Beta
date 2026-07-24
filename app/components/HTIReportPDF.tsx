import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import { deriveHTIScores, formatHTIScore } from "~/utils/htiScoreUtils";

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
    navy:        '#0f172a',
    navyMid:     '#1e293b',
    primary:     '#1e40af',
    primaryMid:  '#2563eb',
    primaryLight:'#dbeafe',
    purple:      '#6d28d9',
    purpleLight: '#ede9fe',
    green:       '#065f46',
    greenMid:    '#059669',
    greenLight:  '#d1fae5',
    amber:       '#92400e',
    amberMid:    '#d97706',
    amberLight:  '#fef3c7',
    red:         '#991b1b',
    redMid:      '#ef4444',
    redLight:    '#fee2e2',
    slate900:    '#0f172a',
    slate800:    '#1e293b',
    slate700:    '#334155',
    slate600:    '#475569',
    slate500:    '#64748b',
    slate400:    '#94a3b8',
    slate300:    '#cbd5e1',
    slate200:    '#e2e8f0',
    slate100:    '#f1f5f9',
    slate50:     '#f8fafc',
    white:       '#ffffff',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    page:            { fontFamily: 'Helvetica', backgroundColor: C.white, paddingBottom: 55 },
    coverPage:       { fontFamily: 'Helvetica', backgroundColor: C.navy, padding: 0 },
    pageBody:        { paddingHorizontal: 36, paddingTop: 24 },

    headerBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                       paddingHorizontal: 36, paddingVertical: 10, backgroundColor: C.navy, marginBottom: 20 },
    headerTitle:     { fontSize: 7.5, color: C.slate400, fontFamily: 'Helvetica', letterSpacing: 0.4 },
    headerRight:     { fontSize: 7.5, color: C.slate500, fontFamily: 'Helvetica' },

    footer:          { position: 'absolute', bottom: 16, left: 36, right: 36, flexDirection: 'row',
                       justifyContent: 'space-between', alignItems: 'center',
                       borderTopWidth: 1, borderTopColor: C.slate200, paddingTop: 7 },
    footerText:      { fontSize: 6.5, color: C.slate400, fontFamily: 'Helvetica' },
    footerPageNum:   { fontSize: 6.5, color: C.primary, fontFamily: 'Helvetica-Bold' },

    // Cover
    coverContent:    { padding: 44, flex: 1, justifyContent: 'space-between' },
    coverScoreBox:   { flex: 1, padding: 16, marginRight: 10, backgroundColor: C.navyMid, borderRadius: 6,
                       borderLeftWidth: 3, borderLeftColor: C.primaryMid },
    coverScoreLabel: { fontSize: 6.8, color: C.slate400, letterSpacing: 0.25, marginBottom: 6, fontFamily: 'Helvetica' },
    coverScoreVal:   { fontSize: 28, color: C.white, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    coverScoreSub:   { fontSize: 7, color: C.slate500, fontFamily: 'Helvetica' },

    // Typography
    sectionChip:     { fontSize: 7, color: C.primaryMid, letterSpacing: 0.75, marginBottom: 5,
                       fontFamily: 'Helvetica-Bold' },
    h1:              { fontSize: 20, color: C.slate900, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
    h2:              { fontSize: 13, color: C.primary, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    h3:              { fontSize: 10.5, color: C.slate800, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 8 },
    h4:              { fontSize: 9, color: C.slate700, fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 6 },
    body:            { fontSize: 9, color: C.slate700, fontFamily: 'Helvetica', lineHeight: 1.6, marginBottom: 5 },
    bodyBold:        { fontSize: 9, color: C.slate800, fontFamily: 'Helvetica-Bold', lineHeight: 1.6 },
    small:           { fontSize: 7.5, color: C.slate500, fontFamily: 'Helvetica', lineHeight: 1.5 },
    label:           { fontSize: 6.5, color: C.slate400, letterSpacing: 0.4, fontFamily: 'Helvetica-Bold', marginBottom: 3 },

    // Cards
    card:            { backgroundColor: C.slate50, borderRadius: 6, padding: 12, marginBottom: 10,
                       borderWidth: 1, borderColor: C.slate200 },
    accentCard:      { backgroundColor: C.primaryLight, borderRadius: 6, padding: 12, marginBottom: 10,
                       borderLeftWidth: 4, borderLeftColor: C.primary },
    warnCard:        { backgroundColor: C.amberLight, borderRadius: 6, padding: 12, marginBottom: 8,
                       borderLeftWidth: 4, borderLeftColor: C.amberMid },
    dangerCard:      { backgroundColor: C.redLight, borderRadius: 6, padding: 12, marginBottom: 8,
                       borderLeftWidth: 4, borderLeftColor: C.redMid },
    greenCard:       { backgroundColor: C.greenLight, borderRadius: 6, padding: 12, marginBottom: 8,
                       borderLeftWidth: 4, borderLeftColor: C.greenMid },
    purpleCard:      { backgroundColor: C.purpleLight, borderRadius: 6, padding: 12, marginBottom: 8,
                       borderLeftWidth: 4, borderLeftColor: C.purple },

    row:             { flexDirection: 'row' },
    col2:            { flex: 1, marginRight: 8 },
    col2Last:        { flex: 1 },

    bullet:          { flexDirection: 'row', marginBottom: 5 },
    bulletDot:       { width: 14, fontSize: 9, color: C.primaryMid, fontFamily: 'Helvetica' },
    bulletText:      { flex: 1, fontSize: 9, color: C.slate700, fontFamily: 'Helvetica', lineHeight: 1.5 },

    barTrack:        { height: 7, backgroundColor: C.slate200, borderRadius: 4, overflow: 'hidden', flex: 1 },
    barFill:         { height: 7, borderRadius: 4 },

    table:           { marginBottom: 10 },
    tableHeader:     { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 6, paddingHorizontal: 8 },
    tableHeaderText: { fontSize: 7.5, color: C.white, fontFamily: 'Helvetica-Bold', flex: 1 },
    tableRow:        { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8,
                       borderBottomWidth: 1, borderBottomColor: C.slate200 },
    tableRowAlt:     { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8,
                       borderBottomWidth: 1, borderBottomColor: C.slate200, backgroundColor: C.slate50 },
    tableCell:       { fontSize: 8, color: C.slate700, fontFamily: 'Helvetica', flex: 1, lineHeight: 1.4 },
    tableCellBold:   { fontSize: 8, color: C.slate900, fontFamily: 'Helvetica-Bold', flex: 1 },

    badge:           { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
    badgeText:       { fontSize: 6.5, fontFamily: 'Helvetica-Bold', letterSpacing: 0.25 },

    chapterBlock:    { marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: C.slate200 },
    chapterNum:      { fontSize: 7.5, color: C.primaryMid, letterSpacing: 0.8, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    chapterTitle:    { fontSize: 18, color: C.slate900, fontFamily: 'Helvetica-Bold' },
    chapterSub:      { fontSize: 8.5, color: C.slate500, fontFamily: 'Helvetica', marginTop: 3 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHTML(html: string): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

interface Block { type: 'h2' | 'h3' | 'h4' | 'p' | 'li'; text: string }

function parseHTML(html: string): Block[] {
    if (!html) return [];
    const blocks: Block[] = [];
    const re = /(<h2[^>]*>[\s\S]*?<\/h2>|<h3[^>]*>[\s\S]*?<\/h3>|<h4[^>]*>[\s\S]*?<\/h4>|<li[^>]*>[\s\S]*?<\/li>|<p[^>]*>[\s\S]*?<\/p>)/gi;
    const matches = html.match(re);
    if (matches) {
        for (const m of matches) {
            const text = stripHTML(m).trim();
            if (!text || text.length < 3) continue;
            if (/<h2/i.test(m)) blocks.push({ type: 'h2', text });
            else if (/<h3/i.test(m)) blocks.push({ type: 'h3', text });
            else if (/<h4/i.test(m)) blocks.push({ type: 'h4', text });
            else if (/<li/i.test(m)) blocks.push({ type: 'li', text });
            else blocks.push({ type: 'p', text });
        }
    }
    if (blocks.length === 0) {
        const plain = stripHTML(html);
        const parts = plain.split(/\.\s+(?=[A-Z])/);
        for (const p of parts) {
            const t = p.trim();
            if (t.length > 15) blocks.push({ type: 'p', text: t.endsWith('.') ? t : t + '.' });
        }
    }
    return blocks;
}

function scoreColor(score: number): string {
    if (score >= 75) return C.greenMid;
    if (score >= 50) return C.amberMid;
    return C.redMid;
}
function statusColor(status: string): string {
    if (status === 'strong') return C.greenMid;
    if (status === 'moderate') return C.amberMid;
    return C.redMid;
}
function timeframeBg(tf: string): string {
    if (tf === 'now') return C.redLight;
    if (tf === 'next') return C.amberLight;
    return C.greenLight;
}
function timeframeColor(tf: string): string {
    if (tf === 'now') return C.red;
    if (tf === 'next') return C.amber;
    return C.green;
}

function clientSafeAuditDetails(action: string, details: string): string {
    if (action.trim().toLowerCase() === 'generated') {
        return 'Assessment-based advisory generated.';
    }

    return details
        .replace(/\s+using\s+[^.]+\.?$/i, '')
        .trim();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PageHeader = ({ chapter, right }: { chapter: string; right: string }) => (
    <View style={S.headerBar} fixed>
        <Text style={S.headerTitle}>{chapter.toUpperCase()}</Text>
        <Text style={S.headerRight}>{right}</Text>
    </View>
);

const PageFooter = ({
    companyId,
    year,
}: {
    companyId: string;
    year: number;
}) => (
    <View style={S.footer} fixed>
        <Text style={S.footerText}>
            © {year} HRTek Systems • HR Transformation Intelligence • {companyId} • Confidential Advisory
        </Text>
        <Text
            style={S.footerPageNum}
            render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
            }
        />
    </View>
);

const Bullet = ({ text, color = C.primaryMid }: { text: string; color?: string }) => (
    <View style={S.bullet}>
        <Text style={[S.bulletDot, { color }]}>•</Text>
        <Text style={S.bulletText}>{text}</Text>
    </View>
);

const ScoreBar = ({ label, score, max = 100, color }: { label: string; score: number; max?: number; color?: string }) => {
    const pct = Math.min((score / max) * 100, 100);
    const fill = color || scoreColor(score);
    return (
        <View style={{ marginBottom: 8 }}>
            {label ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={S.small}>{label}</Text>
                    <Text style={[S.small, { color: fill, fontFamily: 'Helvetica-Bold' }]}>
                        {score}{max === 10 ? '/10' : '%'}
                    </Text>
                </View>
            ) : null}
            <View style={S.barTrack}>
                <View style={[S.barFill, { width: `${pct}%` as any, backgroundColor: fill }]} />
            </View>
        </View>
    );
};

const SectionDivider = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={{ marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: C.slate200 }} wrap={false}>
        <Text style={S.sectionChip}>SECTION</Text>
        <Text style={S.h1}>{title}</Text>
        {sub ? <Text style={S.chapterSub}>{sub}</Text> : null}
    </View>
);

const HTMLContent = ({ html }: { html: string }) => {
    const blocks = parseHTML(html);
    return (
        <View>
            {blocks.map((b, i) => {
                if (b.type === 'h2') return <Text key={i} style={[S.h2, { marginTop: 10 }]}>{b.text}</Text>;
                if (b.type === 'h3') return <Text key={i} style={S.h3}>{b.text}</Text>;
                if (b.type === 'h4') return <Text key={i} style={S.h4}>{b.text}</Text>;
                if (b.type === 'li') return <Bullet key={i} text={b.text} />;
                return <Text key={i} style={S.body}>{b.text}</Text>;
            })}
        </View>
    );
};

// ─── Interface ────────────────────────────────────────────────────────────────

interface HTIReportPDFProps {
    report: {
        companyId: string;
        reportId?: string;
        generatedAt: string;
        inputData?: {
            completedEnginesCount?: number;
            totalEngines?: number;
        };
        advisory: {
            executiveSummary: string;
            detailedSections?: Array<{ title: string; content: string }>;
            currentState: {
                maturityLevel?: string;
                digitalReadiness?: string;
                keyGaps: string[];
                strengths: string[];
            };
            recommendations: { now: string[]; next: string[]; later: string[] };
            riskFlags: Array<{ risk: string; mitigation: string }>;
            dependencies: string[];
            avoidNow: string[];
            successMetrics?: string[];
            transformationReadinessScore?: number;
            riskExposureIndex?: number;
            confidenceScore?: number;
            capabilityHeatmap?: Array<{ engine: string; score: number; status: 'strong' | 'moderate' | 'critical' }>;
            priorityMatrix?: Array<{ initiative: string; impact: number; effort: number; timeframe: 'now' | 'next' | 'later'; category: string }>;
            doNotTransformNow?: Array<{ area: string; reason: string; category: string; revisitIn?: string }>;
            recommendedPricing?: { tierName: string; priceINR: string; priceUSD: string };
            auditTrail?: Array<{ timestamp: string; action: string; details: string }>;
        };
    };
    companyName: string;
}

// ─── Main PDF Component ───────────────────────────────────────────────────────

export const HTIReportPDF: React.FC<HTIReportPDFProps> = ({ report, companyName }) => {
    const { advisory, companyId, generatedAt, reportId } = report;
    const company = companyName.trim() ||"Confidential Client";;

    const generatedDate = new Date(generatedAt);
    const hasValidGeneratedDate = !Number.isNaN(generatedDate.getTime());

    const currentYear = hasValidGeneratedDate
        ? generatedDate.getFullYear()
        : new Date().getFullYear();

    const date = hasValidGeneratedDate
        ? generatedDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : 'Date unavailable';

    const completedEngineCount =
        report.inputData?.completedEnginesCount ??
        advisory.capabilityHeatmap?.length ??
        0;

    const engineCountLabel =
        completedEngineCount > 0
            ? `${completedEngineCount}-Engine Cross-Synthesis`
            : 'Cross-Engine Synthesis';

    const engineCountDescription =
        completedEngineCount > 0
            ? `${completedEngineCount} completed assessment ${
                completedEngineCount === 1 ? 'engine' : 'engines'
            }`
            : 'the completed assessment engines';

    const derivedScores = deriveHTIScores(advisory, report.inputData);

    const readiness = derivedScores.readinessScore;
    const riskIdx = derivedScores.riskScore;
    const confidence = derivedScores.confidenceScore;

    return (
        <Document>

            {/* ══════════════════════════════════════════
                PAGE 1 — COVER
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.coverPage}>
                <View style={{ height: 5, backgroundColor: C.primaryMid }} />
                <View style={S.coverContent}>

                    {/* Brand header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                        <View>
                            <Text style={{ fontSize: 11, color: C.primaryMid, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 2 }}>HRTEKSYSTEM</Text>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', letterSpacing: 0.5 }}>HR TRANSFORMATION INTELLIGENCE PLATFORM</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica' }}>CONFIDENTIAL ADVISORY</Text>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', marginTop: 2 }}>{date}</Text>
                        </View>
                    </View>

                    {/* Title block */}
                    <View style={{ marginBottom: 36 }}>
                        <Text style={{ fontSize: 8, color: C.primaryMid, fontFamily: 'Helvetica-Bold', letterSpacing: 1.2, marginBottom: 14 }}>
                            HTI ADVISORY REPORT
                        </Text>
                        <Text style={{ fontSize: 34, color: C.white, fontFamily: 'Helvetica-Bold', lineHeight: 1.2, marginBottom: 12 }}>
                            HR Transformation{'\n'}Intelligence Advisory
                        </Text>
                        <Text style={{ fontSize: 13, color: '#93c5fd', fontFamily: 'Helvetica', lineHeight: 1.6 }}>
                            Cross-Engine Strategic Synthesis{'\n'}Prepared for {company}
                        </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 24 }} />

                    {/* Score cards */}
                    <View style={{ marginBottom: 28 }}>
                        <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', letterSpacing: 0.8, marginBottom: 12 }}>
                            ADVISORY SCORECARD
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            {[
                                {
                                    label: 'TRANSFORMATION READINESS',
                                    value: formatHTIScore(readiness),
                                    color: readiness === null ? C.slate400 : scoreColor(readiness),
                                    sub: readiness === null
                                        ? 'Score Unavailable'
                                        : readiness >= 75
                                            ? 'Ready to Transform'
                                            : readiness >= 50
                                                ? 'Conditionally Ready'
                                                : 'Pre-Readiness Phase'
                                },
                                {
                                    label: 'RISK EXPOSURE INDEX',
                                    value: formatHTIScore(riskIdx),
                                    color: riskIdx === null ? C.slate400 : scoreColor(100 - riskIdx),
                                    sub: riskIdx === null
                                        ? 'Score Unavailable'
                                        : riskIdx <= 30
                                            ? 'Low Risk Environment'
                                            : riskIdx <= 60
                                                ? 'Moderate Risk'
                                                : 'High Risk Zone'
                                },
                                {
                                    label: 'ADVISORY CONFIDENCE',
                                    value: formatHTIScore(confidence),
                                    color: confidence === null ? C.slate400 : scoreColor(confidence),
                                    sub: confidence === null
                                        ? 'Data Completeness Unknown'
                                        : confidence >= 80
                                            ? 'High Data Completeness'
                                            : confidence >= 60
                                                ? 'Moderate Completeness'
                                                : 'Partial Data'
                                },
                            ].map((s, i, arr) => (
                                <View key={i} style={[S.coverScoreBox, i === arr.length - 1 ? { marginRight: 0 } : {}]}>
                                    <Text style={S.coverScoreLabel}>{s.label}</Text>
                                    <Text style={[S.coverScoreVal, { color: s.color }]}>{s.value}</Text>
                                    <Text style={S.coverScoreSub}>{s.sub}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 20 }} />

                    {/* Footer meta */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', marginBottom: 2 }}>PREPARED FOR</Text>
                            <Text style={{ fontSize: 10, color: C.white, fontFamily: 'Helvetica-Bold' }}>{company}</Text>
                            
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', marginBottom: 2 }}>REPORT REFERENCE</Text>
                            <Text style={{ fontSize: 7.5, color: C.slate300, fontFamily: 'Helvetica' }}>{reportId || 'N/A'}</Text>
                            <Text style={{ fontSize: 7, color: C.slate500, fontFamily: 'Helvetica', marginTop: 2 }}>{engineCountLabel}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 5, backgroundColor: C.purple }} />
            </Page>

            {/* ══════════════════════════════════════════
                PAGE 2 — EXECUTIVE SUMMARY
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Executive Summary" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider
                        title="Executive Summary"
                        sub={`Board-level strategic briefing synthesizing ${engineCountDescription}`}
                    />

                    {(advisory.currentState.maturityLevel || advisory.currentState.digitalReadiness) && (
                        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
                            {advisory.currentState.maturityLevel && (
                                <View style={[S.badge, { backgroundColor: C.primaryLight, marginRight: 8 }]}>
                                    <Text style={[S.badgeText, { color: C.primary }]}>
                                        MATURITY: {advisory.currentState.maturityLevel}
                                    </Text>
                                </View>
                            )}
                            {advisory.currentState.digitalReadiness && (
                                <View style={[S.badge, { backgroundColor: C.greenLight }]}>
                                    <Text style={[S.badgeText, { color: C.green }]}>
                                        READINESS: {advisory.currentState.digitalReadiness}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <HTMLContent html={advisory.executiveSummary} />
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

            {/* ══════════════════════════════════════════
                PAGE 3 — CURRENT STATE DASHBOARD
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Current State Assessment" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider title="Current State Dashboard" sub="Organisational capability baseline across all assessed dimensions" />

                    {/* State Metrics */}
                    <View style={[S.row, { marginBottom: 12 }]}>
                        <View style={[S.accentCard, S.col2]}>
                            <Text style={S.label}>MATURITY LEVEL</Text>
                            <Text style={S.h2}>{advisory.currentState.maturityLevel || 'Not Assessed'}</Text>
                        </View>
                        <View style={[S.accentCard, S.col2Last]}>
                            <Text style={S.label}>DIGITAL READINESS</Text>
                            <Text style={S.h2}>{advisory.currentState.digitalReadiness || 'Not Assessed'}</Text>
                        </View>
                    </View>

                    {/* Capability Heatmap */}
                    {advisory.capabilityHeatmap && advisory.capabilityHeatmap.length > 0 && (
                        <View style={[S.card, { marginBottom: 12 }]}>
                            <Text style={[S.h3, { marginTop: 0, marginBottom: 12 }]}>Capability Heatmap — Engine Scores</Text>
                            {advisory.capabilityHeatmap.map((h, i) => (
                                <View key={i} style={{ marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={S.bodyBold}>{h.engine}</Text>
                                        <View style={[S.badge, {
                                            backgroundColor: h.status === 'strong' ? C.greenLight : h.status === 'moderate' ? C.amberLight : C.redLight
                                        }]}>
                                            <Text style={[S.badgeText, { color: statusColor(h.status) }]}>
                                                {h.status.toUpperCase()} — {h.score}
                                            </Text>
                                        </View>
                                    </View>
                                    <ScoreBar label="" score={h.score} color={statusColor(h.status)} />
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Strengths vs Gaps */}
                    <View style={S.row}>
                        <View style={[S.col2, S.greenCard]}>
                            <Text style={[S.h3, { marginTop: 0, color: C.green, marginBottom: 8 }]}>Key Strengths</Text>
                            {advisory.currentState.strengths.map((s, i) => (
                                <Bullet key={i} text={s} color={C.greenMid} />
                            ))}
                        </View>
                        <View style={[S.col2Last, S.dangerCard]}>
                            <Text style={[S.h3, { marginTop: 0, color: C.red, marginBottom: 8 }]}>Critical Gaps</Text>
                            {advisory.currentState.keyGaps.map((g, i) => (
                                <Bullet key={i} text={g} color={C.redMid} />
                            ))}
                        </View>
                    </View>
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

            {/* ══════════════════════════════════════════
                PAGE 4 — PRIORITY MATRIX
            ══════════════════════════════════════════ */}
            {advisory.priorityMatrix && advisory.priorityMatrix.length > 0 && (
                <Page size="A4" style={S.page}>
                    <PageHeader chapter="Transformation Priority Matrix" right={company} />
                    <View style={S.pageBody}>
                        <SectionDivider title="Transformation Priority Matrix" sub="Impact vs. effort ranking across all strategic initiatives" />

                        <View style={S.table}>
                            <View style={S.tableHeader}>
                                <Text style={[S.tableHeaderText, { flex: 3 }]}>INITIATIVE</Text>
                                <Text style={[S.tableHeaderText, { flex: 1 }]}>IMPACT</Text>
                                <Text style={[S.tableHeaderText, { flex: 1 }]}>EFFORT</Text>
                                <Text style={[S.tableHeaderText, { flex: 1.2 }]}>WHEN</Text>
                                <Text style={[S.tableHeaderText, { flex: 1.5 }]}>CATEGORY</Text>
                            </View>
                            {advisory.priorityMatrix.map((item, i) => (
                                <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                                    <Text style={[S.tableCellBold, { flex: 3 }]}>{item.initiative}</Text>
                                    <Text style={[S.tableCell, { flex: 1, color: item.impact >= 8 ? C.green : item.impact >= 5 ? C.amber : C.red, fontFamily: 'Helvetica-Bold' }]}>
                                        {item.impact}/10
                                    </Text>
                                    <Text style={[S.tableCell, { flex: 1, color: item.effort <= 3 ? C.green : item.effort <= 6 ? C.amber : C.red, fontFamily: 'Helvetica-Bold' }]}>
                                        {item.effort}/10
                                    </Text>
                                    <View style={{ flex: 1.2, justifyContent: 'center' }}>
                                        <View style={[S.badge, { backgroundColor: timeframeBg(item.timeframe), alignSelf: 'flex-start' }]}>
                                            <Text style={[S.badgeText, { color: timeframeColor(item.timeframe) }]}>
                                                {item.timeframe.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[S.tableCell, { flex: 1.5 }]}>{item.category}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={[S.card, { flexDirection: 'row', marginTop: 4 }]}>
                            {[
                                { label: 'NOW', desc: '0–6 months', color: C.red, bg: C.redLight },
                                { label: 'NEXT', desc: '6–18 months', color: C.amber, bg: C.amberLight },
                                { label: 'LATER', desc: '18+ months', color: C.green, bg: C.greenLight },
                            ].map((t, i) => (
                                <View key={i} style={{ flex: 1, alignItems: 'center', marginRight: i < 2 ? 8 : 0 }}>
                                    <View style={[S.badge, { backgroundColor: t.bg, marginBottom: 3 }]}>
                                        <Text style={[S.badgeText, { color: t.color }]}>{t.label}</Text>
                                    </View>
                                    <Text style={S.small}>{t.desc}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
                </Page>
            )}

            {/* ══════════════════════════════════════════
                PAGES 5–12 — 8 DETAILED CHAPTERS
            ══════════════════════════════════════════ */}
            {advisory.detailedSections?.map((section, idx) => (
                <Page key={idx} size="A4" style={S.page}>
                    <PageHeader chapter={`Chapter ${idx + 1}`} right={company} />
                    <View style={S.pageBody}>
                        <View style={S.chapterBlock}>
                            <Text style={S.chapterNum}>CHAPTER {String(idx + 1).padStart(2, '0')} OF {advisory.detailedSections!.length}</Text>
                            <Text style={S.chapterTitle}>{section.title}</Text>
                        </View>
                        <HTMLContent html={section.content} />
                    </View>
                    <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
                </Page>
            ))}

            {/* ══════════════════════════════════════════
                RECOMMENDATIONS PAGE
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Strategic Recommendations" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider title="Strategic Roadmap Recommendations" sub="Phased transformation actions across three time horizons" />

                    {advisory.recommendations.now.length > 0 && (
                        <View style={[S.dangerCard, { marginBottom: 10 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={[S.badge, { backgroundColor: C.redLight, marginRight: 6 }]}>
                                    <Text style={[S.badgeText, { color: C.red }]}>PHASE 1 — NOW</Text>
                                </View>
                                <Text style={[S.small, { color: C.red }]}>0–6 Months</Text>
                            </View>
                            {advisory.recommendations.now.map((r, i) => (
                                <Bullet key={i} text={r} color={C.redMid} />
                            ))}
                        </View>
                    )}

                    {advisory.recommendations.next.length > 0 && (
                        <View style={[S.warnCard, { marginBottom: 10 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={[S.badge, { backgroundColor: C.amberLight, marginRight: 6 }]}>
                                    <Text style={[S.badgeText, { color: C.amber }]}>PHASE 2 — NEXT</Text>
                                </View>
                                <Text style={[S.small, { color: C.amber }]}>6–18 Months</Text>
                            </View>
                            {advisory.recommendations.next.map((r, i) => (
                                <Bullet key={i} text={r} color={C.amberMid} />
                            ))}
                        </View>
                    )}

                    {advisory.recommendations.later.length > 0 && (
                        <View style={[S.greenCard, { marginBottom: 10 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={[S.badge, { backgroundColor: C.greenLight, marginRight: 6 }]}>
                                    <Text style={[S.badgeText, { color: C.green }]}>PHASE 3 — BEYOND</Text>
                                </View>
                                <Text style={[S.small, { color: C.green }]}>18+ Months</Text>
                            </View>
                            {advisory.recommendations.later.map((r, i) => (
                                <Bullet key={i} text={r} color={C.greenMid} />
                            ))}
                        </View>
                    )}
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

            {/* ══════════════════════════════════════════
                RISK & DEPENDENCY PAGE
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Risk & Dependency Analysis" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider title="Risk Vectors & Dependency Map" sub="Cross-engine risk exposure and initiative sequencing dependencies" />

                    {advisory.riskFlags.length > 0 && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={[S.h2, { marginBottom: 10 }]}>Critical Risk Vectors</Text>
                            {advisory.riskFlags.map((r, i) => (
                                <View key={i} style={[S.dangerCard, { marginBottom: 8 }]}>
                                    <Text style={[S.bodyBold, { color: C.red, marginBottom: 4 }]}>{r.risk}</Text>
                                    <Text style={[S.body, { marginBottom: 0, color: C.slate700 }]}>
                                        Mitigation: {r.mitigation}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {advisory.dependencies.length > 0 && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={S.h2}>Initiative Dependencies</Text>
                            {advisory.dependencies.map((d, i) => (
                                <Bullet key={i} text={d} color={C.purple} />
                            ))}
                        </View>
                    )}

                    {advisory.avoidNow.length > 0 && (
                        <View style={S.warnCard}>
                            <Text style={[S.h3, { marginTop: 0, color: C.amber, marginBottom: 8 }]}>
                                What NOT to Attempt Now
                            </Text>
                            {advisory.avoidNow.map((a, i) => (
                                <Bullet key={i} text={a} color={C.amberMid} />
                            ))}
                        </View>
                    )}
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

            {/* ══════════════════════════════════════════
                CAUTION ZONES + SUCCESS METRICS
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Caution Zones & Success Metrics" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider title="Caution Zones & KPIs" sub="Areas to defer and measurable success indicators for transformation" />

                    {advisory.doNotTransformNow && advisory.doNotTransformNow.length > 0 && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={[S.h2, { marginBottom: 8 }]}>Caution Zones — Do Not Transform Yet</Text>
                            <View style={S.table}>
                                <View style={S.tableHeader}>
                                    <Text style={[S.tableHeaderText, { flex: 2 }]}>AREA</Text>
                                    <Text style={[S.tableHeaderText, { flex: 1 }]}>CATEGORY</Text>
                                    <Text style={[S.tableHeaderText, { flex: 3 }]}>REASON</Text>
                                    <Text style={[S.tableHeaderText, { flex: 1 }]}>REVISIT IN</Text>
                                </View>
                                {advisory.doNotTransformNow.map((item, i) => (
                                    <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                                        <Text style={[S.tableCellBold, { flex: 2 }]}>{item.area}</Text>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <View style={[S.badge, { backgroundColor: C.amberLight, alignSelf: 'flex-start' }]}>
                                                <Text style={[S.badgeText, { color: C.amber }]}>{item.category}</Text>
                                            </View>
                                        </View>
                                        <Text style={[S.tableCell, { flex: 3 }]}>{item.reason}</Text>
                                        <Text style={[S.tableCell, { flex: 1 }]}>{item.revisitIn || '—'}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {advisory.successMetrics && advisory.successMetrics.length > 0 && (
                        <View style={[S.accentCard, { marginBottom: 12 }]}>
                            <Text style={[S.h3, { marginTop: 0, marginBottom: 10 }]}>Success Metrics & KPIs</Text>
                            {advisory.successMetrics.map((m, i) => (
                                <Bullet key={i} text={m} color={C.primaryMid} />
                            ))}
                        </View>
                    )}

                    {advisory.recommendedPricing && (
                        <View style={S.purpleCard}>
                            <Text style={[S.h3, { marginTop: 0, color: C.purple, marginBottom: 8 }]}>
                                Recommended HRTek Service Tier
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={S.label}>TIER</Text>
                                    <Text style={S.bodyBold}>{advisory.recommendedPricing.tierName}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={S.label}>PRICING (INR)</Text>
                                    <Text style={S.bodyBold}>{advisory.recommendedPricing.priceINR}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={S.label}>PRICING (USD)</Text>
                                    <Text style={S.bodyBold}>{advisory.recommendedPricing.priceUSD}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

            {/* ══════════════════════════════════════════
                FINAL PAGE — TERMS & CONDITIONS
            ══════════════════════════════════════════ */}
            <Page size="A4" style={S.page}>
                <PageHeader chapter="Terms, Conditions & Audit" right={company} />
                <View style={S.pageBody}>
                    <SectionDivider title="Terms & Conditions" sub="Confidentiality, advisory scope, and usage guidelines" />

                    {[
                        {
                            num: '01', title: 'Confidentiality & Proprietary Information',
                            text: 'This HTI Advisory Report is strictly confidential and proprietary to HRTekSystem. It contains sensitive business intelligence and strategic recommendations prepared exclusively for the named organisation. Unauthorized disclosure, reproduction, distribution, or use by any third party is strictly prohibited.'
                        },
                        {
                            num: '02', title: 'Advisory Nature of Recommendations',
                            text: 'This report provides strategic advisory and recommendations based on assessment data provided by the client organisation. HRTekSystem does not guarantee specific outcomes or financial results from implementing these recommendations. All strategic decisions remain the sole responsibility of the client organisation and its leadership.'
                        },
                        {
                            num: '03',
                            title: 'Data Accuracy & Limitation of Liability',
                            text: `Recommendations are based solely on the information provided through ${engineCountDescription}. HRTekSystem is not liable for decisions made based on this advisory. The client organisation should conduct additional due diligence before implementing major transformation initiatives.`
                        },
                        {
                            num: '04',
                            title: 'Assessment-Based Intelligence Disclosure',
                            text: `This report incorporates automated analysis of the organisation's assessment responses across ${engineCountDescription}. Findings and recommendations should be considered alongside appropriate management review and due diligence before major investment or transformation decisions are made.`
                        },
                    ].map((t, i) => (
                        <View key={i} style={[S.card, { marginBottom: 8 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ width: 22, height: 22, backgroundColor: C.primaryLight, borderRadius: 4,
                                    alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}>
                                    <Text style={{ fontSize: 7.5, color: C.primary, fontFamily: 'Helvetica-Bold' }}>{t.num}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[S.bodyBold, { marginBottom: 3 }]}>{t.title}</Text>
                                    <Text style={[S.small, { lineHeight: 1.5 }]}>{t.text}</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {advisory.auditTrail && advisory.auditTrail.length > 0 && (
                        <View style={[S.card, { marginTop: 6 }]}>
                            <Text style={[S.h4, { marginTop: 0, marginBottom: 8 }]}>Report Audit Trail</Text>
                            {advisory.auditTrail.map((entry, i) => (
                                <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
                                    <Text style={[S.small, { color: C.slate400, width: 90, flexShrink: 0 }]}>
                                        {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                                    </Text>
                                    <Text style={[S.small, { color: C.primaryMid, width: 100, flexShrink: 0, fontFamily: 'Helvetica-Bold' }]}>
                                        {entry.action}
                                    </Text>
                                    <Text style={[S.small, { flex: 1 }]}>
                                        {clientSafeAuditDetails(
                                            entry.action,
                                            entry.details
                                        )}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <Text style={[S.small, { color: C.slate400, textAlign: 'center', marginBottom: 4 }]}>
                            By using this report, the recipient acknowledges and agrees to these terms and conditions.
                        </Text>
                        <Text style={[S.small, { color: C.primary, fontFamily: 'Helvetica-Bold', textAlign: 'center' }]}>
                            Generated by HRTekSystem — HR Transformation Intelligence Platform
                        </Text>
                        <Text style={[S.small, { color: C.slate400, textAlign: 'center', marginTop: 2 }]}>
                            © {currentYear} HRTekSystem Pvt. Ltd. All Rights Reserved.
                        </Text>
                    </View>
                </View>
                <PageFooter
                    companyId={companyId}
                    year={currentYear}
                />
            </Page>

        </Document>
    );
};

export default HTIReportPDF;
