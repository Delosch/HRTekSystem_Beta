import { Link, useFetcher } from "@remix-run/react";
import { CheckCircle, ShieldCheck, Zap, Clock, Star, ArrowRight, Package } from "lucide-react";
import { ENGINE_PRICING } from "~/config/pricing.config";
import React, { useState, useEffect } from "react";

/**
 * Engine Pricing Card Component
 *
 * Displays pricing information for a specific engine
 * Premium B2B design with clear value proposition
 */

interface EnginePricingCardProps {
    engineId: string;
    productName?: string;
    className?: string;
}

export default function EnginePricingCard({ engineId, productName, className = "" }: EnginePricingCardProps) {
    const engine = ENGINE_PRICING.find(e => e.id === engineId);
    const fetcher = useFetcher();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [fetcher.state, fetcher.data]);

    if (!engine) return null;

    const targetName = productName || engine.name;

    const features = [
        { icon: <Zap className="w-3.5 h-3.5" />, text: "AI-powered analysis & diagnostics" },
        { icon: <Star className="w-3.5 h-3.5" />, text: "Actionable strategic recommendations" },
        { icon: <Package className="w-3.5 h-3.5" />, text: "Visual dashboards & downloadable reports" },
        { icon: <Clock className="w-3.5 h-3.5" />, text: "Lifetime access — no renewals" },
    ];

    const trustBadges = [
        { icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />, label: "Secure Checkout" },
        { icon: <CheckCircle className="w-3.5 h-3.5 text-slate-500" />, label: "Instant Access" },
    ];

    return (
        <div className={`relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            {/* Success toast */}
            {showSuccess && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg z-20 animate-bounce">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Added to cart!
                </div>
            )}

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── LEFT: Pricing info ── */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Engine Pricing</p>
                                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                                    {engine.name}
                                </h3>
                            </div>
                        </div>

                        {/* Price block */}
                        <div className="flex items-center gap-3 mb-1 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                            <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-black text-slate-800">Company-Based Pricing</p>
                                <p className="text-[11px] text-slate-500 font-medium">Pricing is calculated based on your employee count. View exact price in your cart.</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 font-medium">One-time purchase · No subscription · No hidden fees</p>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <span className="flex-shrink-0 text-blue-500">{f.icon}</span>
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Actions ── */}
                    <div className="flex flex-col justify-between gap-3 lg:w-56 w-full">
                        {/* Value pill */}
                        <div className="hidden lg:flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Best Value
                            </span>
                        </div>

                        {/* Primary CTA */}
                        <fetcher.Form method="post" action="/startTransformationDashboard" className="w-full">
                            <input type="hidden" name="intent" value="addToCart" />
                            <input type="hidden" name="engineName" value={targetName} />
                            <button
                                type="submit"
                                disabled={fetcher.state === "submitting" || showSuccess}
                                className={`w-full py-3 px-5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95 flex justify-center items-center gap-2 ${
                                    showSuccess
                                        ? "bg-emerald-500 text-white shadow-emerald-200 cursor-default"
                                        : fetcher.state === "submitting"
                                        ? "bg-blue-400 text-white cursor-wait"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300"
                                }`}
                            >
                                {fetcher.state === "submitting" ? (
                                    <span className="animate-pulse text-sm">Adding to cart…</span>
                                ) : showSuccess ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Done!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Add to Cart
                                    </>
                                )}
                            </button>
                        </fetcher.Form>

                        {/* Secondary CTA */}
                        <Link
                            to={`/payment/manual?engines=${engine.id}`}
                            className="w-full border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-200 text-center flex items-center justify-center gap-1.5 group"
                        >
                            View Pricing Details
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 pt-1">
                            {trustBadges.map((b, i) => (
                                <div key={i} className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                    {b.icon}
                                    {b.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact Engine Pricing Badge
 * For use in headers or sidebars
 */
interface EnginePricingBadgeProps {
    engineId: string;
}

export function EnginePricingBadge({ engineId }: EnginePricingBadgeProps) {
    const engine = ENGINE_PRICING.find(e => e.id === engineId);

    if (!engine) return null;

    return (
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-blue-400">Engine Pricing</p>
                <p className="text-xs font-bold text-blue-700">View price in cart</p>
            </div>
        </div>
    );
}
