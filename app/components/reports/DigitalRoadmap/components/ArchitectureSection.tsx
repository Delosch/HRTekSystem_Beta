import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Sparkles,
  Database,
  Cloud,
  Zap,
  MessageSquare,
  BarChart3,
  Workflow,
  ChevronRight,
} from "lucide-react";

interface ArchitectureSectionProps {
  data: any;
}

export function ArchitectureSection({ data }: ArchitectureSectionProps) {
  const [activeView, setActiveView] = useState<
    "integration" | "enablers"
  >("integration");

  const cloudPercent = data['cloud-percent'] || 45;
  const apiReadiness = data['api-readiness'] || 35;
  const mobileAccess = data['mobile-access'] === 'yes' || data['mobile-access'] === true;

  const maturityLevels = [
    {
      level: "Legacy",
      status: cloudPercent < 30 ? "current" : "past",
      description: "Siloed systems, manual data transfer, no APIs",
      characteristics: [
        "Batch file transfers",
        "Point-to-point integrations",
        "High maintenance cost",
      ],
    },
    {
      level: "Integrated",
      status: (cloudPercent >= 30 && cloudPercent < 70) ? "current" : (cloudPercent < 30 ? "target" : "past"),
      description: "Connected via middleware, some automation",
      characteristics: [
        "ESB/middleware layer",
        "Scheduled data sync",
        "Basic error handling",
      ],
    },
    {
      level: "API-Enabled",
      status: cloudPercent >= 70 ? "current" : "target",
      description: "RESTful APIs, real-time sync, scalable",
      characteristics: [
        "Modern API gateway",
        "Real-time data flow",
        "Event-driven architecture",
      ],
    },
    {
      level: "Microservices",
      status: "future",
      description: "Cloud-native, containerized, fully automated",
      characteristics: [
        "Service mesh",
        "Auto-scaling",
        "AI-native integrations",
      ],
    },
  ];

  const digitalEnablers = [
    {
      name: "RPA (Robotic Process Automation)",
      icon: Workflow,
      adoption: data['automation-percent'] || 25,
      useCases: ["Payroll reconciliation", "Employee migration"],
      impact: "Automates manual HR tasks, reducing time by 70%",
    },
    {
      name: "AI Chatbots",
      icon: MessageSquare,
      adoption: data['ai-familiarity'] > 70 ? 20 : 0,
      useCases: ["Leave requests", "Policy Q&A"],
      impact: "Handles 60% of routine queries",
    },
    {
      name: "Advanced Analytics",
      icon: BarChart3,
      adoption: data['data-quality'] > 70 ? 15 : 5,
      useCases: ["Attrition prediction", "Talent insights"],
      impact: "Reduces attrition costs by 18-25%",
    },
    {
      name: "Mobile Access",
      icon: Zap,
      adoption: mobileAccess ? 85 : 10,
      useCases: ["On-the-go approvals", "Employee self-service"],
      impact: "Improves employee experience by 40%",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">
          Architecture & Tools Ecosystem
        </h1>
        <p className="text-slate-600 font-medium">
          Mapping your {cloudPercent}% cloud-native landscape and API maturity to 
          ensure technical feasibility of the digital roadmap.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant={activeView === "integration" ? "default" : "outline"}
          onClick={() => setActiveView("integration")}
          className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]"
        >
          Integration Maturity
        </Button>
        <Button
          variant={activeView === "enablers" ? "default" : "outline"}
          onClick={() => setActiveView("enablers")}
          className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]"
        >
          Digital Enablers
        </Button>
      </div>

      {activeView === "integration" ? (
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <div className="grid grid-cols-4 gap-4 mb-8">
             {maturityLevels.map((level, i) => (
               <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${
                 level.status === 'current' ? 'bg-blue-900 text-white border-blue-900 shadow-xl scale-105' : 
                 level.status === 'target' ? 'bg-teal-50 border-teal-200 text-teal-900 border-dashed' : 
                 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'
               }`}>
                 <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{level.status}</p>
                 <h4 className="font-bold text-sm mb-2">{level.level}</h4>
                 <p className="text-[10px] font-medium leading-tight">{level.description}</p>
               </div>
             ))}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">API Readiness Index</h3>
                <span className="text-2xl font-black text-blue-900">{apiReadiness}%</span>
             </div>
             <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900" style={{ width: `${apiReadiness}%` }} />
             </div>
             <p className="mt-4 text-xs text-slate-500 font-medium leading-relaxed">
               Your current API readiness of {apiReadiness}% suggests a 
               {apiReadiness < 40 ? ' high dependency on manual data middleware' : ' strong foundation for real-time AI integration'}.
             </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
           {digitalEnablers.map((enabler, i) => (
             <Card key={i} className="p-6 bg-white border-slate-200 hover:shadow-lg transition-all group">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-blue-50 text-blue-900 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-colors">
                    <enabler.icon className="w-6 h-6" />
                 </div>
                 <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{enabler.adoption}%</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adoption</p>
                 </div>
               </div>
               <h3 className="font-bold text-slate-900 mb-2">{enabler.name}</h3>
               <p className="text-xs text-slate-600 font-medium mb-4">{enabler.impact}</p>
               <div className="space-y-1">
                  {enabler.useCases.map((uc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <div className="w-1 h-1 bg-blue-400 rounded-full" />
                      <span>{uc}</span>
                    </div>
                  ))}
               </div>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
