import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

interface LogoProps {
    className?: string;
    showText?: boolean;
    orientation?: "horizontal" | "stacked" | "vertical";
}

export default function Logo({
    className = "",
    showText = true,
    orientation = "horizontal"
}: LogoProps) {
    const isVertical = orientation === "vertical";
    const isStacked = orientation === "stacked";

    return (
        <Link
            to="/"
            className={`flex group transition-all duration-300 ${isVertical ? "flex-col items-start gap-3" : "flex-row items-center gap-4"
                } ${className}`}
        >
            {/* Enhanced Logo Icon Container */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0">
                {/* Professional Frame - Glassmorphism */}
                <div className="relative z-10 w-full h-full p-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-500">
                    <img
                        src="/logo_icon_final.png"
                        alt="HR-Tek"
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                </div>

                {/* Subtle Ambient Glow */}
                <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl group-hover:bg-cyan-500/20 transition-colors duration-500" />
            </div>

            {/* Branding Text */}
            {showText && (
                <div className="flex flex-col">
                    <div className={`flex font-black tracking-tighter leading-none whitespace-nowrap ${isStacked || isVertical ? "flex-col gap-0.5" : "items-center"
                        }`}>
                        <span className={`text-white group-hover:text-cyan-50 transition-colors ${isStacked || isVertical ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                            }`}>
                            HR-TEK
                        </span>
                        <span className={`text-cyan-400 group-hover:text-cyan-300 transition-colors ${(isStacked || isVertical) ? "text-lg md:text-xl" : "text-xl md:text-2xl ml-1"
                            }`}>
                            SYSTEM
                        </span>
                    </div>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        className="h-[1px] bg-gradient-to-r from-cyan-400 to-transparent mt-1.5 opacity-40 shrink-0"
                    />
                </div>
            )}
        </Link>
    );
}
