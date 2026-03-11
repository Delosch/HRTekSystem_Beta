import { Lightbulb, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

interface AIInsightProps {
  type: "ai" | "warning" | "success";
  title: string;
  description: React.ReactNode;
}

export function AIInsight({ type, title, description }: AIInsightProps) {
  const styles = {
    ai: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Sparkles,
      titleColor: "text-blue-900",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: AlertTriangle,
      titleColor: "text-amber-900",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: CheckCircle2,
      titleColor: "text-emerald-900",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-xl border ${style.bg} ${style.border} shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg h-fit ${style.iconBg}`}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        <div>
          <h4 className={`text-sm font-bold mb-1 ${style.titleColor}`}>
            {type === "ai" ? "AI Strategic Insight" : title}
          </h4>
          {type === "ai" && <h5 className="text-xs font-semibold text-slate-700 mb-1">{title}</h5>}
          <div className="text-xs text-slate-600 leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
