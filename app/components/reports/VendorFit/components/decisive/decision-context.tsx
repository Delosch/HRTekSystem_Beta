import { Badge } from "~/components/ui/badge";
import { Users, Globe, Zap, Layers, Target, Crosshair } from "lucide-react";
import { motion } from "framer-motion";

const decisionContext = {
    profile: {
        size: "1,000-5,000 Emp",
        geo: "Multi-country (2-5)",
        maturity: "Data-driven HR",
    },
    preferences: {
        tech: "Unified HCM Suite",
        budget: "Balanced ROI",
    },
    topDrivers: [
        "Streamline HR processes",
        "Enable data-driven decision making",
        "Support business growth/scalability"
    ]
};

interface DecisionContextProps {
    data: any;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export function DecisionContext({ data }: DecisionContextProps) {
    const profile = data?.organizationDemographics || decisionContext.profile;
    const goals = data?.businessPriorityFit?.goals || [];
    const topDrivers = goals.length > 0 ? goals.map((g: any) => g.name) : decisionContext.topDrivers;

    const displayContext = {
        profile: {
            size: profile.employeeCount || decisionContext.profile.size,
            geo: profile.geographicalPresence || decisionContext.profile.geo,
            maturity: decisionContext.profile.maturity,
            tech: decisionContext.preferences.tech
        },
        topDrivers: topDrivers
    };

    const contextCards = [
        { icon: Users, label: "Org Size", value: displayContext.profile.size, color: "text-orange-500", bg: "bg-orange-500/10" },
        { icon: Globe, label: "Geography", value: displayContext.profile.geo, color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Zap, label: "Maturity", value: displayContext.profile.maturity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: Layers, label: "Tech Pref", value: displayContext.profile.tech, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Crosshair className="w-4 h-4 text-slate-900" />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Evaluation Context — Input Parameters
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {contextCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center group hover:bg-slate-50 shadow-xl shadow-slate-900/5 transition-all duration-300"
                    >
                        <div className={`p-3 ${card.bg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{card.label}</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight leading-snug">{card.value}</p>
                    </motion.div>
                ))}

                <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl rounded-3xl border border-orange-100 p-6 flex flex-col justify-center group shadow-xl shadow-orange-900/5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-orange-600" />
                        <p className="text-[8px] font-black text-orange-600 uppercase tracking-[0.3em]">Primary Goals</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {displayContext.topDrivers.slice(0, 2).map((driver: string, i: number) => (
                            <Badge key={i} className="bg-white text-slate-900 border-slate-200 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-sm">
                                {driver}
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
