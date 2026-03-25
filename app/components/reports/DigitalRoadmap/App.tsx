import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { StrategicReportPreview } from '../StrategicReportPreview';
import type { HTIAdvisoryContent } from '~/models/hti.model.server';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  FileBarChart, 
  Target, 
  Network, 
  Users, 
  Shield, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Download,
  Share2,
  ArrowLeft,
  Rocket
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { OverviewSection } from './components/OverviewSection';
import { StrategicDriversSection } from './components/StrategicDriversSection';
import { CurrentCapabilitySection } from './components/CurrentCapabilitySection';
import { DigitalPrioritiesSection } from './components/DigitalPrioritiesSection';
import { ChangeReadinessSection } from './components/ChangeReadinessSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { GovernanceSection } from './components/GovernanceSection';
import { BudgetTimelineSection } from './components/BudgetTimelineSection';
import { LivingRoadmapSection } from './components/LivingRoadmapSection';

type ScenarioType = 'conservative' | 'balanced' | 'aggressive';

interface AppProps {
  data?: { responses?: Record<string, any>; progress?: number };
  brandName?: string;
  companyLogo?: string;
  reportId?: string | null;
}

export default function App({ data, brandName, reportId }: AppProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [scenario, setScenario] = useState<ScenarioType>('balanced');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportSnapshot, setReportSnapshot] = useState<HTIAdvisoryContent | null>(null);
  const fetcher = useFetcher();
  const isGenerating = fetcher.state !== 'idle';

  const orgName = brandName || "Your Organization";

  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).success) {
      setReportSnapshot((fetcher.data as any).advisory);
    }
  }, [fetcher.data]);

  const responses = data?.responses ?? {};

  // Calculate scores (Mirroring ResultsDashboard logic)
  const calculateOverallScore = () => {
    let total = 0;
    let count = 0;
    const scores = [
      responses['alignment'] || 0,
      responses['standardization'] || 0,
      responses['sop-maturity'] || 0,
      responses['data-quality'] || 0,
      responses['automation-percent'] || 0,
      responses['ai-comfort'] || 0,
      responses['business-influence'] || 0,
      responses['shared-services-maturity'] || 0,
      responses['past-success'] || 0,
      responses['digital-capability'] || 0,
      responses['compliance-automation'] || 0,
      responses['budget-readiness'] || 0,
      responses['ecosystem-openness'] || 0,
    ];
    scores.forEach(score => {
      if (score) {
        total += Number(score);
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 62; // Default to 62 if no data
  };

  const overallScore = calculateOverallScore();

  const indices = {
    governance: Math.round(((Number(responses['standardization']) || 0) + (Number(responses['compliance-automation']) || 0)) / 2) || 58,
    capability: Math.round(((Number(responses['data-quality']) || 0) + (Number(responses['digital-capability']) || 0)) / 2) || 64,
    infrastructure: Math.round(((Number(responses['automation-percent']) || 0) + (Number(responses['vendor-optimization']) || 0)) / 2) || 52,
    strategy: Math.round(((Number(responses['alignment']) || 0) + (Number(responses['business-influence']) || 0)) / 2) || 71,
    maturity: Math.round(((Number(responses['sop-maturity']) || 0) + (Number(responses['shared-services-maturity']) || 0)) / 2) || 45,
  };

  const transformationRisk = 100 - (Math.round(((Number(responses['past-success']) || 0) + (Number(responses['digital-capability']) || 0)) / 2) || 42);
  const adoptionProbability = Math.round(((Number(responses['past-success']) || 0) + (Number(responses['digital-capability']) || 0) + (Number(responses['ai-comfort']) || 0)) / 3) || 68;

  const navigation = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'strategic', label: 'Strategic Drivers', icon: Target },
    { id: 'capability', label: 'Current Capability', icon: FileBarChart },
    { id: 'priorities', label: 'Digital Priorities', icon: Sparkles },
    { id: 'readiness', label: 'Change Readiness', icon: Users },
    { id: 'architecture', label: 'Architecture & Tools', icon: Network },
    { id: 'governance', label: 'Governance & Metrics', icon: Shield },
    { id: 'budget', label: 'Budget & Timeline', icon: Calendar },
    { id: 'roadmap', label: 'AI Roadmap', icon: TrendingUp },
  ];

  const handleExport = () => {
    setIsPreviewOpen(true);
    if (!reportSnapshot) {
      fetcher.submit(
        {
          intent: "generate_report",
          params: "HR Transformation Roadmap Generator",
          answers: responses || {},
          progress: 100
        },
        { method: "post", encType: "application/json" }
      );
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
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
            <div className="relative text-blue-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none italic">HR Roadmap</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 antialiased">Strategic</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
          <div className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modules</div>
          {navigation.map((item) => {
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
                    layoutId="nav-bg-roadmap"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" 
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-blue-600'}`} />
                <span className={`text-[11px] font-black uppercase tracking-[0.15em] text-left flex-1 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Digital Live</span>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">ENGINE v2.1.0-RD</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.1em] opacity-60">Strategic Planning Session</p>
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
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Digital Roadmap</h1>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Strategic Generator</span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col justify-center gap-1">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Organization Profile</h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {orgName}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="hidden md:flex flex-col justify-center gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Scenario:</span>
              </div>
              <Select value={scenario} onValueChange={(value) => setScenario(value as ScenarioType)}>
                <SelectTrigger className="w-40 h-10 border-slate-200 rounded-xl font-bold bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="group relative h-12 bg-slate-900 overflow-hidden text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  Export Report
                  <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-12 py-20 space-y-32 pb-40">
            <section id="overview" className="scroll-mt-32">
              <OverviewSection 
                overallScore={overallScore} 
                risk={transformationRisk} 
                adoption={adoptionProbability} 
                financial={Number(responses['budget-readiness']) || 55} 
              />
            </section>
            <section id="strategic" className="scroll-mt-32">
              <StrategicDriversSection data={responses} />
            </section>
            <section id="capability" className="scroll-mt-32">
              <CurrentCapabilitySection data={responses} />
            </section>
            <section id="priorities" className="scroll-mt-32">
              <DigitalPrioritiesSection data={responses} />
            </section>
            <section id="readiness" className="scroll-mt-32">
               <ChangeReadinessSection data={{ ...responses, overallScore, adoptionProbability }} />
            </section>
            <section id="architecture" className="scroll-mt-32">
               <ArchitectureSection data={{ ...responses, overallScore }} />
            </section>
            <section id="governance" className="scroll-mt-32">
               <GovernanceSection data={{ ...responses, overallScore }} />
            </section>
            <section id="budget" className="scroll-mt-32">
               <BudgetTimelineSection scenario={scenario} data={{ ...responses, overallScore }} />
            </section>
            <section id="roadmap" className="scroll-mt-32">
               <LivingRoadmapSection scenario={scenario} data={{ ...responses, overallScore, changeReadiness: adoptionProbability }} />
            </section>
          </div>

          <footer className="px-12 py-10 border-t border-slate-200 bg-white flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img src="/hrtek_logo.png" alt="HRTek" className="h-5 brightness-0 opacity-30" />
              <div className="w-px h-4 bg-slate-200" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                Built for Strategic Transformation Leaders
              </p>
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
              CONFIDENTIAL // HRTEK RD-ENGINE v2.1
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
        engineTitle="HR Transformation Roadmap"
        brandName={orgName}
      />
    </div>
  );
}


