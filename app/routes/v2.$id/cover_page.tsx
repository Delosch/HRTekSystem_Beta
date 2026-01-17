import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { MetaData } from "./schemas";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";

export const CoverPage = ({ metadata, orgName }: { metadata: MetaData, orgName: string }) => {
    const completion_date = new Date(metadata.completion_date || "").toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtle_date = new Date(metadata.completion_date || "").toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center text-center p-12 relative z-20">
            {/* Top Left Branding */}
            {/* Client Branding - Top Left */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-8 left-8 text-left flex items-center gap-4"
            >
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
                    <BuildingOffice2Icon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                    <p className="font-bold text-xl text-white tracking-tight">{orgName || 'Client Organisation'}</p>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full mt-1"></div>
                </div>
            </motion.div>

            {/* Platform Branding - Top Right */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-8 right-8 text-right flex flex-col items-end"
            >
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="text-right mr-3 hidden md:block">
                        <span className="block text-white font-bold text-sm tracking-tight group-hover:text-indigo-400 transition-colors">HRTEK SYSTEM</span>
                        <span className="block text-[8px] text-slate-500 uppercase tracking-[0.3em]">Intelligence Platform</span>
                    </div>
                    <img src="/hrtek_logo.png" alt="HRTEK Logo" className="w-12 h-12 object-contain rounded-xl shadow-2xl shadow-indigo-500/10 group-hover:scale-110 transition-transform" />
                </Link>
            </motion.div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-center items-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold tracking-[0.2em] mb-6 uppercase">
                        Confidential Strategic Analysis
                    </span>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tigher">
                        Digital Maturity <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                            Assessment Report
                        </span>
                    </h1>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-2xl text-slate-400 font-light mb-12"
                >
                    Comprehensive Diagnostics & Transformation Roadmap • {subtle_date}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="p-6 glass-card rounded-2xl flex flex-col items-center border border-white/5"
                >
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Assessment Reference ID</p>
                    <p className="font-mono text-lg text-indigo-200">{metadata.assessment_id}</p>
                </motion.div>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute bottom-8 text-center w-full"
            >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                <p className="text-slate-500 text-sm font-medium">Generated on {completion_date}</p>
                <p className="text-slate-600 text-xs mt-1 uppercase tracking-widest">Powered by HR-Tek System Intelligence Engine</p>
            </motion.div>
        </div>
    )
}