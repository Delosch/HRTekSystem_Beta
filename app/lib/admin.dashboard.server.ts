import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getPendingPaymentVerifications } from "~/models/payment.model.server";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

// ── Engine display metadata ──────────────────────────────────────────────────
const ENGINE_META: Record<string, { short: string; color: string }> = {
    "Cognitive HCM Vendor Fit":          { short: "HCM Fit",        color: "#4F46E5" },
    "HCM Vendor Fit Engine":             { short: "HCM Fit",        color: "#4F46E5" },
    "HR Transformation Roadmap Generator": { short: "Roadmap",      color: "#00B5E2" },
    "HR Technology Maturity Analysis":   { short: "Maturity",       color: "#F59E0B" },
    "Shared Service Designer":           { short: "Shared Services", color: "#EC4899" },
    "Intelligent Change Management":     { short: "Change Mgmt",    color: "#6366F1" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLast7Months(): { label: string; year: number; month: number }[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (6 - i));
        return {
            label: d.toLocaleDateString("en-US", { month: "short" }),
            year: d.getFullYear(),
            month: d.getMonth(),
        };
    });
}

function inMonth(iso: string, m: number, y: number): boolean {
    const d = new Date(iso);
    return d.getMonth() === m && d.getFullYear() === y;
}

function getMoMTrend(
    items: any[],
    field: string
): { value: string; positive: boolean } {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const lm = cm === 0 ? 11 : cm - 1;
    const ly = cm === 0 ? cy - 1 : cy;
    const cur  = items.filter(x => x[field] && inMonth(x[field], cm, cy)).length;
    const last = items.filter(x => x[field] && inMonth(x[field], lm, ly)).length;
    if (last === 0) return { value: cur > 0 ? "New" : "—", positive: cur > 0 };
    const pct = Math.round(((cur - last) / last) * 100);
    return { value: pct >= 0 ? `+${pct}%` : `${pct}%`, positive: pct >= 0 };
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return `${days}d ago`;
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function getDashboardStats() {
    const ddbDocClient = getDynamoDBDocumentClient();
    const months = getLast7Months();

    try {
        const [companiesRes, usersRes, enginesRes, htiPendingRes, paymentsRes] =
            await Promise.all([
                // All company profiles
                ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "profile_type = :t",
                    ExpressionAttributeValues: { ":t": "COMPANY" },
                    ProjectionExpression: "pk, company_name, createdAt",
                })),
                // All user profiles
                ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "profile_type = :t",
                    ExpressionAttributeValues: { ":t": "USER" },
                    ProjectionExpression: "pk, first_name, last_name, createdAt, is_verified_email",
                })),
                // All engine records
                ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(sk, :p)",
                    ExpressionAttributeValues: { ":p": "ENGINE#" },
                    ProjectionExpression: "pk, sk, progress, completedAt",
                })),
                // Pending HTI reports
                ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(sk, :p) AND #st = :s",
                    ExpressionAttributeNames: { "#st": "status" },
                    ExpressionAttributeValues: { ":p": "HTI_REPORT#", ":s": "pending" },
                    ProjectionExpression: "companyId, generatedAt",
                })),
                // Recent payment records
                ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(sk, :p)",
                    ExpressionAttributeNames: { "#st": "status" },
                    ExpressionAttributeValues: { ":p": "PAYMENT#" },
                    ProjectionExpression: "companyId, invoiceNumber, #st, invoiceDate",
                })),
            ]);

        const companies  = companiesRes.Items  || [];
        const users      = usersRes.Items      || [];
        const engines    = enginesRes.Items    || [];
        const htiPending = htiPendingRes.Items || [];
        const payments   = paymentsRes.Items   || [];

        // ── Counts ────────────────────────────────────────────────────────────
        const totalCompanies    = companies.length;
        const totalUsers        = users.length;
        const activeAssessments = engines.filter((e: any) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
        const pendingHTIReports = htiPending.length;
        const pendingUsers      = users.filter((u: any) => u.is_verified_email === false).length;

        const pendingPaymentsList = await getPendingPaymentVerifications();
        const pendingPayments = pendingPaymentsList.length;

        // ── MoM Trends ────────────────────────────────────────────────────────
        const companyTrend    = getMoMTrend(companies, "createdAt");
        const userTrend       = getMoMTrend(users, "createdAt");

        // ── Monthly Growth Chart ──────────────────────────────────────────────
        const monthlyGrowth = months.map(m => ({
            name: m.label,
            companies: companies.filter(
                (c: any) => c.createdAt && inMonth(c.createdAt, m.month, m.year)
            ).length,
            users: users.filter(
                (u: any) => u.createdAt && inMonth(u.createdAt, m.month, m.year)
            ).length,
        }));

        // ── Engine Utilization ────────────────────────────────────────────────
        const engineCounts: Record<string, { count: number; color: string }> = {};
        engines.forEach((e: any) => {
            if (!e.sk) return;
            const rawName = (e.sk as string).replace("ENGINE#", "");
            const meta = ENGINE_META[rawName];
            if (!meta) return;
            if (!engineCounts[meta.short]) engineCounts[meta.short] = { count: 0, color: meta.color };
            engineCounts[meta.short].count++;
        });

        const totalEngineRecords = Object.values(engineCounts).reduce((a, b) => a + b.count, 0);
        const engineUsage = Object.entries(engineCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([name, { count, color }]) => {
                const pct = totalEngineRecords > 0 ? Math.round((count / totalEngineRecords) * 100) : 0;
                return { name, value: pct, color, percentage: `${pct}%` };
            });

        // ── Recent Activity Feed ──────────────────────────────────────────────
        const events: { id: string; msg: string; time: string; type: string; rawTime: string }[] = [];

        companies.forEach((c: any) => {
            if (!c.createdAt) return;
            events.push({
                id: `co-${c.pk}`,
                msg: `New company registered: ${c.company_name || c.pk?.replace("COMPANY#", "") || "Unknown"}`,
                time: timeAgo(c.createdAt),
                rawTime: c.createdAt,
                type: "success",
            });
        });

        users.forEach((u: any) => {
            if (!u.createdAt) return;
            const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || "New user";
            events.push({
                id: `us-${u.pk}`,
                msg: `New user joined: ${name}`,
                time: timeAgo(u.createdAt),
                rawTime: u.createdAt,
                type: "info",
            });
        });

        payments.forEach((p: any) => {
            const ts = p.invoiceDate || "";
            if (!ts) return;
            const statusLabel =
                p.status === "payment_verified" ? "verified" :
                p.status === "payment_rejected" ? "rejected" :
                p.status === "payment_submitted" ? "submitted" : "updated";
            events.push({
                id: `pay-${p.invoiceNumber || ts}`,
                msg: `Payment ${statusLabel} — Invoice ${p.invoiceNumber || "N/A"} (${p.companyId?.replace("COMPANY#", "") || ""})`,
                time: timeAgo(ts),
                rawTime: ts,
                type: p.status === "payment_verified" ? "success" :
                       p.status === "payment_rejected" ? "warning" : "info",
            });
        });

        htiPending.forEach((h: any) => {
            if (!h.generatedAt) return;
            events.push({
                id: `hti-${h.generatedAt}`,
                msg: `HTI Advisory submitted for review — ${h.companyId?.replace("COMPANY#", "") || "company"}`,
                time: timeAgo(h.generatedAt),
                rawTime: h.generatedAt,
                type: "warning",
            });
        });

        events.sort((a, b) => new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime());
        const recentActivity = events.slice(0, 5).map(({ rawTime: _raw, ...e }) => e);

        console.log(`📊 Dashboard — Companies: ${totalCompanies}, Users: ${totalUsers}, Engines active: ${activeAssessments}, Pending HTI: ${pendingHTIReports}`);

        return {
            totalCompanies,
            totalUsers,
            activeAssessments,
            pendingPayments,
            pendingInvoices: pendingPayments, // alias for backward compat
            pendingHTIReports,
            pendingUsers,
            companyTrend,
            userTrend,
            monthlyGrowth,
            engineUsage,
            recentActivity,
        };
    } catch (error) {
        console.error("❌ Dashboard stats error:", error);
        return {
            totalCompanies: 0,
            totalUsers: 0,
            activeAssessments: 0,
            pendingPayments: 0,
            pendingInvoices: 0,
            pendingHTIReports: 0,
            pendingUsers: 0,
            companyTrend:  { value: "—", positive: true },
            userTrend:     { value: "—", positive: true },
            monthlyGrowth: months.map(m => ({ name: m.label, companies: 0, users: 0 })),
            engineUsage: [],
            recentActivity: [],
        };
    }
}

// ── Activity log (richer, for activity-logs page) ────────────────────────────
export async function getFullActivityLog(): Promise<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    type: "info" | "success" | "warning" | "error";
}[]> {
    const ddbDocClient = getDynamoDBDocumentClient();

    try {
        const [companiesRes, usersRes, enginesRes, htiRes, paymentsRes] = await Promise.all([
            ddbDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "profile_type = :t",
                ExpressionAttributeValues: { ":t": "COMPANY" },
                ProjectionExpression: "pk, company_name, createdAt, createdBy",
            })),
            ddbDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "profile_type = :t",
                ExpressionAttributeValues: { ":t": "USER" },
                ProjectionExpression: "pk, first_name, last_name, email, createdAt",
            })),
            ddbDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "begins_with(sk, :p) AND progress = :done",
                ExpressionAttributeValues: { ":p": "ENGINE#", ":done": 100 },
                ProjectionExpression: "pk, sk, completedAt",
            })),
            ddbDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "begins_with(sk, :p)",
                ExpressionAttributeNames: { "#st": "status" },
                ExpressionAttributeValues: { ":p": "HTI_REPORT#" },
                ProjectionExpression: "companyId, generatedAt, #st, approvedAt, approvedBy, generatedBy",
            })),
            ddbDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "begins_with(sk, :p)",
                ExpressionAttributeNames: { "#st": "status" },
                ExpressionAttributeValues: { ":p": "PAYMENT#" },
                ProjectionExpression: "companyId, invoiceNumber, #st, invoiceDate, verifiedAt, verifiedBy",
            })),
        ]);

        const logs: {
            id: string; timestamp: string; user: string;
            action: string; details: string;
            type: "info" | "success" | "warning" | "error";
        }[] = [];

        let counter = 0;

        // Company registrations
        (companiesRes.Items || []).forEach((c: any) => {
            if (!c.createdAt) return;
            logs.push({
                id: `co-${counter++}`,
                timestamp: c.createdAt,
                user: c.createdBy || "System",
                action: "Company Registered",
                details: `${c.company_name || c.pk?.replace("COMPANY#", "") || "Unknown company"} joined the platform`,
                type: "success",
            });
        });

        // User registrations
        (usersRes.Items || []).forEach((u: any) => {
            if (!u.createdAt) return;
            const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || "Unknown";
            logs.push({
                id: `us-${counter++}`,
                timestamp: u.createdAt,
                user: name,
                action: "User Registered",
                details: `${name} created an account${u.email ? ` (${u.email})` : ""}`,
                type: "info",
            });
        });

        // Engine completions
        (enginesRes.Items || []).forEach((e: any) => {
            const ts = e.completedAt;
            if (!ts) return;
            const rawName = (e.sk || "").replace("ENGINE#", "");
            const shortName = ENGINE_META[rawName]?.short || rawName;
            const companyId = (e.pk || "").replace("COMPANY#", "");
            logs.push({
                id: `eng-${counter++}`,
                timestamp: ts,
                user: "System",
                action: "Assessment Completed",
                details: `Company ${companyId} completed ${shortName} engine assessment`,
                type: "info",
            });
        });

        // HTI reports
        (htiRes.Items || []).forEach((h: any) => {
            if (h.generatedAt) {
                const companyId = (h.companyId || "").replace("COMPANY#", "");
                logs.push({
                    id: `hti-gen-${counter++}`,
                    timestamp: h.generatedAt,
                    user: h.generatedBy || "System",
                    action: "HTI Advisory Generated",
                    details: `HTI Advisory submitted for admin review — ${companyId}`,
                    type: "warning",
                });
            }
            if (h.status === "approved" && h.approvedAt) {
                logs.push({
                    id: `hti-app-${counter++}`,
                    timestamp: h.approvedAt,
                    user: h.approvedBy || "Admin",
                    action: "HTI Advisory Approved",
                    details: `Advisory approved for ${(h.companyId || "").replace("COMPANY#", "")}`,
                    type: "success",
                });
            }
            if (h.status === "rejected" && h.approvedAt) {
                logs.push({
                    id: `hti-rej-${counter++}`,
                    timestamp: h.approvedAt,
                    user: h.approvedBy || "Admin",
                    action: "HTI Advisory Rejected",
                    details: `Advisory rejected for ${(h.companyId || "").replace("COMPANY#", "")}`,
                    type: "error",
                });
            }
        });

        // Payments
        (paymentsRes.Items || []).forEach((p: any) => {
            const ts = p.invoiceDate || p.verifiedAt;
            if (!ts) return;
            const companyId = (p.companyId || "").replace("COMPANY#", "");
            const statusLabel =
                p.status === "payment_verified"  ? "Payment Verified"  :
                p.status === "payment_rejected"  ? "Payment Rejected"  :
                p.status === "payment_submitted" ? "Payment Submitted" : "Payment Updated";
            const type: "success" | "warning" | "error" | "info" =
                p.status === "payment_verified"  ? "success" :
                p.status === "payment_rejected"  ? "warning" : "info";
            logs.push({
                id: `pay-${counter++}`,
                timestamp: ts,
                user: p.verifiedBy || "System",
                action: statusLabel,
                details: `Invoice ${p.invoiceNumber || "N/A"} — ${companyId}`,
                type,
            });
        });

        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return logs.slice(0, 50);
    } catch (error) {
        console.error("❌ Activity log error:", error);
        return [];
    }
}
