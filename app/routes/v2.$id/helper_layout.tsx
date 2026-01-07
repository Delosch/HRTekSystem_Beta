import { ReactNode } from "react";
import { motion } from "framer-motion";

export const Section = ({ title, subtitle, children }: { title: string, subtitle?: string, children: ReactNode }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="p-8 md:p-12 relative z-10 border-t border-indigo-500/10"
    >
        <div className="mb-10">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{title}</h2>
            {subtitle && <p className="text-lg text-slate-400 max-w-2xl">{subtitle}</p>}
        </div>
        {children}
    </motion.section>
);