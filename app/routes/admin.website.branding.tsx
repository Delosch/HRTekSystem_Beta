import {
  PaintBrushIcon,
  SwatchIcon,
  PhotoIcon,
  TypeSpecimenIcon,
  SparklesIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  VariableIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function BrandAssetsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 px-4 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest border border-rose-100"
        >
          <SparklesIcon className="h-4 w-4" />
          Brand Experience · Phase 2
        </motion.div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Identity</span> Hub
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Centralize your brand DNA. Manage logos, typography, and color systems for a unified digital presence.
        </p>
      </div>

      {/* Main Teaser Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-orange-400 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden min-h-[500px] grid grid-cols-1 lg:grid-cols-2">

          {/* Left: Interactive Preview Mimic */}
          <div className="bg-slate-50 p-12 flex flex-col justify-center border-r border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

            <div className="space-y-8 relative z-10">
              {/* Logo Preview Block */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Brandmark</span>
                  <div className="h-2 w-8 bg-emerald-400 rounded-full" />
                </div>
                <div className="h-24 w-full rounded-2xl bg-indigo-600 flex items-center justify-center">
                  <div className="h-10 w-10 bg-white/20 rounded-lg animate-pulse" />
                  <div className="ml-3 h-4 w-24 bg-white/20 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Color Palette Block */}
              <div className="grid grid-cols-4 gap-3">
                {['#4F46E5', '#10B981', '#F59E0B', '#F43F5E'].map((color, i) => (
                  <motion.div
                    key={color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="aspect-square rounded-2xl shadow-sm border-4 border-white"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Typography Block */}
              <div className="space-y-2">
                <div className="h-10 w-full bg-white rounded-xl border border-gray-200 flex items-center px-4">
                  <span className="text-sm font-bold text-gray-800">Inter var / Bold</span>
                </div>
                <div className="h-10 w-2/3 bg-white rounded-xl border border-gray-200 flex items-center px-4">
                  <span className="text-sm font-medium text-gray-400">Roboto / Medium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content & Roadmap */}
          <div className="p-12 flex flex-col justify-center">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-8">
              <PaintBrushIcon className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Consistent Brand Governance</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Ensure visual harmony across all touchpoints. Our upcoming Brand Hub will allow real-time synchronization of CSS variables and asset delivery.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-rose-50/30 transition-colors group/item">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <PhotoIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Asset Management</h4>
                  <p className="text-xs text-gray-400">SVG/PNG Logo variations for Dark/Light modes.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-orange-50/30 transition-colors group/item">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <VariableIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Dynamic Stylesheet</h4>
                  <p className="text-xs text-gray-400">Global CSS variable synchronization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Device Branding Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10" />
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">Responsive Brand Consistency</h3>
          <p className="text-slate-400 max-w-xl mx-auto">See how your brand scales from high-resolution desktop banners to mobile-first system icons in real-time.</p>
          <div className="flex justify-center items-center gap-12 pt-8">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white group hover:bg-white/10 transition-all cursor-default">
                <ComputerDesktopIcon className="h-10 w-10" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desktop</span>
            </div>
            <div className="h-px w-12 bg-white/10 hidden sm:block" />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white group hover:bg-white/10 transition-all cursor-default">
                <DevicePhoneMobileIcon className="h-10 w-10" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-center pt-8 border-t border-gray-100">
        <button className="flex items-center gap-3 px-10 py-4 bg-rose-600 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-rose-600/20 active:scale-95 transition-all group">
          <CloudArrowUpIcon className="h-6 w-6 group-hover:translate-y-[-2px] transition-transform" />
          Sign me up for early access
        </button>
        <p className="mt-4 text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em]">Deployment Queue: Phase 2 Rollout</p>
      </div>
    </div>
  );
}
