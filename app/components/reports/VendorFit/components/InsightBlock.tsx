import { Lightbulb } from "lucide-react";

interface InsightBlockProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "info";
}

export function InsightBlock({ children, variant = "default" }: InsightBlockProps) {
    const colors = {
        default: "border-l-blue-600 bg-blue-50/50",
        success: "border-l-green-600 bg-green-50/50",
        warning: "border-l-amber-600 bg-amber-50/50",
        info: "border-l-teal-600 bg-teal-50/50",
    };

    return (
        <div className={`pl-6 pr-6 py-5 border-l-4 ${colors[variant]} rounded-r-lg my-6`}>
            <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 mt-1 text-gray-600 flex-shrink-0" />
                <div className="text-gray-800 leading-relaxed italic">
                    {children}
                </div>
            </div>
        </div>
    );
}
