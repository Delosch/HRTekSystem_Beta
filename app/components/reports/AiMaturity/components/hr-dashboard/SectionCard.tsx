import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  score?: number;
}

export function SectionCard({ icon: Icon, title, description, children, score }: SectionCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 75) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s >= 50) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s >= 25) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
              <p className="text-xs text-slate-500 mt-1 leading-normal max-w-2xl">
                {description}
              </p>
            </div>
          </div>
          {score !== undefined && (
            <div className={`shrink-0 px-3 py-1.5 rounded-lg border text-sm font-bold ${getScoreColor(score)}`}>
              Your Score: {score}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
