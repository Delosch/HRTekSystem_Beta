import { CheckCircle2, Wrench, Plug, Cloud, Activity, Cpu, Link, Pocket, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "~/components/ui/badge";

interface Integration {
    name: string;
    vendorA: "native" | "api" | "none";
    vendorB: "native" | "api" | "none";
    vendorC: "native" | "api" | "none";
}

const integrations: Integration[] = [
    { name: "Slack", vendorA: "native", vendorB: "api", vendorC: "api" },
    { name: "Salesforce CRM", vendorA: "native", vendorB: "native", vendorC: "api" },
    { name: "SAP ERP", vendorA: "native", vendorB: "native", vendorC: "native" },
    { name: "Microsoft Teams", vendorA: "native", vendorB: "api", vendorC: "none" },
    { name: "Zoom", vendorA: "native", vendorB: "native", vendorC: "api" },
];

const techStackMetrics = [
    { metric: "Cloud Security Score", vendorA: 98, vendorB: 92, vendorC: 88, icon: Cloud },
    { metric: "API Maturity Level", vendorA: 95, vendorB: 85, vendorC: 78, icon: Cpu },
    { metric: "Uptime SLA", vendorA: 99.9, vendorB: 99.5, vendorC: 99.0, icon: Activity },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function TechnicalCompatibility({ data }: { data: any }) {
    const getIntegrationIcon = (type: "native" | "api" | "none") => {
        if (type === "native") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        if (type === "api") return <Wrench className="w-5 h-5 text-amber-400" />;
        return <div className="w-5 h-5 text-red-500 flex items-center justify-center text-xs font-black">X</div>;
    };

    const getIntegrationText = (type: "native" | "api" | "none") => {
        if (type === "native") return { text: "Native", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (type === "api") return { text: "API Build", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { text: "No Support", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    };

    const vendorANativeCount = integrations.filter(i => i.vendorA === "native").length;

    return (
        <motion.section
            id="technical-ecosystem"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                        Architecture Audit
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Fit</span> Scorecard
                    </h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5">
                    <Plug className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vendorANativeCount}/{integrations.length} Native Connectors</span>
                </div>
            </div>

            <div className="bg-emerald-500/5 backdrop-blur-md rounded-3xl border border-emerald-500/20 p-6 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Link className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1 italic underline">Integration Advantage</h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                        Vendor A is the <strong>only candidate</strong> with a certified Native Connector for our existing stack. This eliminates <strong className="text-emerald-400">$25k in custom API development</strong> and reduces time-to-value by 3 weeks.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Pocket className="w-5 h-5 text-emerald-500" />
                        Integration Matrix
                    </h3>

                    <div className="space-y-4">
                        {integrations.map((integration, idx) => (
                            <div key={integration.name} className="bg-slate-950/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 hover:bg-slate-900/60 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                                            <Zap className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{integration.name}</h4>
                                    </div>
                                    {integration.vendorA === "native" && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[8px] uppercase font-black px-2">Advantage A</Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: "Vendor A", type: integration.vendorA },
                                        { label: "Vendor B", type: integration.vendorB },
                                        { label: "Vendor C", type: integration.vendorC },
                                    ].map((vendor, vIdx) => {
                                        const styles = getIntegrationText(vendor.type);
                                        return (
                                            <div key={vIdx} className={`p-4 rounded-2xl border transition-all ${vendor.label === 'Vendor A' && vendor.type === 'native' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-white/5'}`}>
                                                <div className="flex justify-center mb-3">
                                                    {getIntegrationIcon(vendor.type)}
                                                </div>
                                                <div className={`text-[8px] font-black uppercase tracking-widest text-center px-1.5 py-0.5 rounded-full border mb-1 ${styles.color}`}>
                                                    {styles.text}
                                                </div>
                                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center">{vendor.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Stack Metrics
                    </h3>

                    <div className="space-y-4">
                        {techStackMetrics.map((metric, idx) => (
                            <div key={metric.metric} className="bg-slate-950/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <metric.icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{metric.metric}</h4>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { vendor: "A", score: metric.vendorA, color: "bg-emerald-500" },
                                        { vendor: "B", score: metric.vendorB, color: "bg-amber-500" },
                                        { vendor: "C", score: metric.vendorC, color: "bg-red-500" },
                                    ].map((v) => (
                                        <div key={v.vendor} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-500">Vendor {v.vendor}</span>
                                                <span className="text-white">{v.score}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${v.score}%` }}
                                                    className={`h-full ${v.color}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}
