import { Badge } from "~/components/ui/badge";
import { Sparkles, Info, Layers, Boxes, Code, Ban, Search, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const featureData = [
    {
        vendor: "Vendor A",
        native: 78,
        configurable: 15,
        customization: 5,
        notSupported: 2,
    },
    {
        vendor: "Vendor B",
        native: 65,
        configurable: 22,
        customization: 10,
        notSupported: 3,
    },
    {
        vendor: "Vendor C",
        native: 58,
        configurable: 25,
        customization: 12,
        notSupported: 5,
    },
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

export function RequirementMatching({ data }: { data: any }) {
    return (
        <motion.section
            id="capability-coverage"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                        RAG Evaluation
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Capability <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Coverage</span> Analysis
                    </h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">450 Pages AI Analyzed</span>
                </div>
            </div>

            <div className="bg-blue-500/5 backdrop-blur-md rounded-3xl border border-blue-500/20 p-6 flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Layers className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1 italic underline">Key Coverage Finding</h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                        Vendor A offers <strong className="text-blue-400">15% more native features</strong> than the competition, specifically in Talent Management. This eliminates costly customizations and reduces implementation risk.
                    </p>
                </div>
            </div>

            <motion.div variants={itemVariants} className="bg-slate-950/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />

                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-8 flex items-center gap-3">
                    <Boxes className="w-5 h-5 text-blue-500" />
                    Feature Coverage Breakdown
                </h3>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={featureData} layout="vertical" barSize={40} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                                type="category"
                                dataKey="vendor"
                                width={100}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px'
                                }}
                                itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            />
                            <Legend iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '30px' }} />
                            <defs>
                                <linearGradient id="nativeGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                                <linearGradient id="configurableGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#2dd4bf" />
                                </linearGradient>
                            </defs>
                            <Bar dataKey="native" stackId="a" fill="url(#nativeGradient)" name="Native Support" radius={[4, 0, 0, 4]} />
                            <Bar dataKey="configurable" stackId="a" fill="url(#configurableGradient)" name="Configurable" />
                            <Bar dataKey="customization" stackId="a" fill="#f59e0b" name="Customization" />
                            <Bar dataKey="notSupported" stackId="a" fill="#ef4444" name="Unmet" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Search className="w-4 h-4 text-blue-500" />
                            Coverage Gap Details
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                            Vendor C requires <span className="text-white">12% Customization</span>, creating technical debt. Custom code often breaks during updates, leading to expensive maintenance cycles.
                        </p>
                    </div>
                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Engine recommendation
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                            Vendor A provides <span className="text-white">78% Native Support</span>, ensuring features are maintained by the vendor rather than your internal engineering team.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Native Support", value: 78, color: "bg-blue-600", icon: Layers },
                    { label: "Configurable", value: 15, color: "bg-teal-500", icon: Boxes },
                    { label: "Custom Dev", value: 5, color: "bg-amber-500", icon: Code },
                    { label: "Not Supported", value: 2, color: "bg-red-500", icon: Ban },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 flex flex-col items-center text-center group hover:bg-slate-900/60 transition-all"
                    >
                        <div className={`p-3 rounded-xl mb-4 ${item.color}/10`}>
                            <item.icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter mb-1">{item.value}%</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.value}%` }}
                                transition={{ duration: 1, delay: 0.8 + (idx * 0.1) }}
                                className={`h-full ${item.color}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
