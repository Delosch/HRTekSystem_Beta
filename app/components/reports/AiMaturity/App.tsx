import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { StrategicReportPreview } from "../StrategicReportPreview";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";
import { motion } from "framer-motion";
import { Section1TechArchitecture } from "./components/hr-dashboard/Section1TechArchitecture";
import { Section2ProcessIntelligence } from "./components/hr-dashboard/Section2ProcessIntelligence";
import { Section3DataGravity } from "./components/hr-dashboard/Section3DataGravity";
import { Section4CostROI } from "./components/hr-dashboard/Section4CostROI";
import { Section5ChangeVelocity } from "./components/hr-dashboard/Section5ChangeVelocity";
import { Section6AIDepth } from "./components/hr-dashboard/Section6AIDepth";
import { Section7ExperienceIntelligence } from "./components/hr-dashboard/Section7ExperienceIntelligence";
import { Section8Governance } from "./components/hr-dashboard/Section8Governance";
import { Section9Scalability } from "./components/hr-dashboard/Section9Scalability";
import { Section10OperatingModel } from "./components/hr-dashboard/Section10OperatingModel";
import { ExecutiveSummary } from "./components/hr-dashboard/ExecutiveSummary";
import { Button } from "./components/ui/button";
import {
  Layers,
  GitBranch,
  Gauge,
  DollarSign,
  Zap,
  Brain,
  Heart,
  Shield,
  TrendingUp,
  Settings,
  Award,
  Download,
  Share2,
  Menu,
  X,
  LayoutDashboard,
  ArrowLeft,
  Rocket
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const sections = [
  { id: "summary", name: "Executive Summary", icon: LayoutDashboard },
  { id: "section1", name: "Tech Architecture", icon: Layers },
  { id: "section2", name: "Process Intelligence", icon: GitBranch },
  { id: "section3", name: "Data Gravity", icon: Gauge },
  { id: "section4", name: "Cost & ROI", icon: DollarSign },
  { id: "section5", name: "Change Velocity", icon: Zap },
  { id: "section6", name: "AI Depth", icon: Brain },
  { id: "section7", name: "Experience Intelligence", icon: Heart },
  { id: "section8", name: "Governance & Risk", icon: Shield },
  { id: "section9", name: "Scalability & M&A", icon: TrendingUp },
  { id: "section10", name: "Operating Model", icon: Settings },
];

// Question IDs per dimension (10 dimensions, 34 total questions, options 0–4 where 4 = best)
const DIM_QUESTION_IDS = [
  [1, 2, 3, 4],       // Dim 1: Tech Architecture
  [5, 6, 7, 8],       // Dim 2: Process Intelligence
  [9, 10, 11, 12],    // Dim 3: Data Gravity
  [13, 14, 15],       // Dim 4: Cost ROI
  [16, 17, 18],       // Dim 5: Change Velocity
  [19, 20, 21, 22],   // Dim 6: AI Depth
  [23, 24, 25],       // Dim 7: Experience Intelligence
  [26, 27, 28],       // Dim 8: Governance Risk
  [29, 30, 31],       // Dim 9: Scalability
  [32, 33, 34],       // Dim 10: Operating Model
];

function computeDimScore(questionIds: number[], responses: Record<string, number>): number {
  const answered = questionIds.filter(id => responses[id.toString()] !== undefined);
  if (answered.length === 0) return 0;
  const total = answered.reduce((sum, id) => sum + (responses[id.toString()] ?? 0), 0);
  return Math.round((total / (answered.length * 4)) * 100);
}

interface AppProps {
  data?: { responses?: Record<string, number>; progress?: number };
  brandName?: string;
  companyLogo?: string;
  reportId?: string | null;
}

function App({ data, brandName, reportId }: AppProps) {
  const [activeSection, setActiveSection] = useState("summary");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportSnapshot, setReportSnapshot] = useState<HTIAdvisoryContent | null>(null);
  const fetcher = useFetcher();
  const isGenerating = fetcher.state !== "idle";

  const orgName = brandName || "Your Organization";

  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).success) {
      setReportSnapshot((fetcher.data as any).advisory);
    }
  }, [fetcher.data]);

  const responses = data?.responses ?? {};
  const dimScores = DIM_QUESTION_IDS.map(ids => computeDimScore(ids, responses));
  const overallScore = dimScores.length > 0
    ? Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length)
    : 0;

  const handleExport = () => {
    setIsPreviewOpen(true);
    if (!reportSnapshot) {
      fetcher.submit(
        {
          intent: "generate_report",
          params: "AI Driven Maturity Engine",
          answers: responses || {},
          progress: 100
        },
        { method: "post", encType: "application/json" }
      );
    }
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard", {
      description: "Stakeholders can now access this diagnostic report.",
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Toaster />
      
      {/* Premium Sidebar - Matching Change Management Style */}
      <aside className="w-64 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 z-[100] flex flex-col shadow-2xl shadow-slate-900/5">
        <div className="pt-10 pb-8 px-8 flex flex-col gap-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
          </button>

          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative text-indigo-600">
              <Brain className="w-7 h-7" />
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none italic">AI Maturity</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 antialiased">Diagnostic</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
          <div className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modules</div>
          {sections.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  w-full group flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-500 relative overflow-hidden
                  ${isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-bg-ai"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent pointer-events-none" 
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                <span className={`text-[11px] font-black uppercase tracking-[0.15em] text-left flex-1 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-10 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Audit Active</span>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">ENGINE v3.0.0-AI</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.1em] opacity-60">Confidential Session</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Premium Header - Matching Change Management */}
        <header className="h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-[90] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 border-r border-slate-200 pr-8">
              <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">AI Maturity</h1>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">Diagnostic Report</span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col justify-center gap-1">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Organization Profile</h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {orgName}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="hidden md:flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Maturity</span>
                <span className="text-xs font-black text-indigo-600 italic">{overallScore}%</span>
              </div>
              <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/50">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${overallScore}%` }} 
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="group relative h-12 bg-slate-900 overflow-hidden text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  Export Report
                  <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-12 py-20 space-y-32 pb-40">
            <section id="summary" className="scroll-mt-32">
              <ExecutiveSummary dimScores={dimScores} overallScore={overallScore} brandName={brandName} />
            </section>

            {[
              { id: "section1", component: Section1TechArchitecture, score: dimScores[0] },
              { id: "section2", component: Section2ProcessIntelligence, score: dimScores[1] },
              { id: "section3", component: Section3DataGravity, score: dimScores[2] },
              { id: "section4", component: Section4CostROI, score: dimScores[3] },
              { id: "section5", component: Section5ChangeVelocity, score: dimScores[4] },
              { id: "section6", component: Section6AIDepth, score: dimScores[5] },
              { id: "section7", component: Section7ExperienceIntelligence, score: dimScores[6] },
              { id: "section8", component: Section8Governance, score: dimScores[7] },
              { id: "section9", component: Section9Scalability, score: dimScores[8] },
              { id: "section10", component: Section10OperatingModel, score: dimScores[9] },
            ].map((item, idx) => {
              const Comp = item.component;
              return (
                <section 
                  key={item.id}
                  id={item.id} 
                  className="scroll-mt-32"
                >
                  <Comp dimScore={item.score} data={responses} />
                </section>
              );
            })}
          </div>

          <footer className="px-12 py-10 border-t border-slate-200 bg-white flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img src="/hrtek_logo.png" alt="HRTek" className="h-5 brightness-0 opacity-30" />
              <div className="w-px h-4 bg-slate-200" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                Built for AI-Driven Strategic Leadership
              </p>
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
              CONFIDENTIAL // HRTEK AI-ENGINE v3.0
            </div>
          </footer>
        </main>
      </div>

      <StrategicReportPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportData={reportSnapshot}
        isGenerating={isGenerating}
        error={(fetcher.data as any)?.error}
        engineTitle="AI Driven Maturity Engine"
        brandName={orgName}
      />
    </div>
  );
}


export default App;
