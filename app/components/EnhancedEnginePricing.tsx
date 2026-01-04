import { Link } from "@remix-run/react";
import { Zap } from "lucide-react";
import { formatCurrency } from "~/services/pricing.calculator";

interface Engine {
    id: string;
    name: string;
    description: string;
    basePrice: number;
}

interface EnhancedEnginePricingProps {
    engines: Engine[];
}

export function EnhancedEnginePricing({ engines }: EnhancedEnginePricingProps) {
    // Define unique gradient and icon colors for each engine
    const gradients = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-orange-500 to-red-500',
        'from-green-500 to-emerald-500',
        'from-indigo-500 to-purple-500'
    ];

    const iconBgs = [
        'bg-blue-100',
        'bg-purple-100',
        'bg-orange-100',
        'bg-green-100',
        'bg-indigo-100'
    ];

    const iconColors = [
        'text-blue-600',
        'text-purple-600',
        'text-orange-600',
        'text-green-600',
        'text-indigo-600'
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Powerful Assessment Engines
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose individual engines or get the complete bundle. Click any card to explore features and start your assessment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {engines.map((engine, index) => (
                        <Link
                            key={engine.id}
                            to={`/engines/${engine.id}`}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        >
                            {/* Gradient Top Border */}
                            <div className={`h-2 bg-gradient-to-r ${gradients[index % 5]}`} />

                            <div className="p-6">
                                {/* Icon and Price */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${iconBgs[index % 5]} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                        <Zap className={`w-8 h-8 ${iconColors[index % 5]}`} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            {formatCurrency(engine.basePrice, "INR")}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">one-time</div>
                                    </div>
                                </div>

                                {/* Engine Name */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {engine.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                                    {engine.description}
                                </p>

                                {/* CTA Button */}
                                <div className={`flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${gradients[index % 5]} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300`}>
                                    <span>Explore Engine</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Border Effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-2xl pointer-events-none transition-all duration-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
