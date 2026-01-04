import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SimpleEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    rows?: number;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
    label,
    value,
    onChange,
    multiline = false,
    rows = 3
}) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            )}
        </div>
    );
};

interface ArrayEditorProps {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}

export const ArrayEditor: React.FC<ArrayEditorProps> = ({
    label,
    items,
    onChange,
    placeholder = "Enter item..."
}) => {
    const addItem = () => {
        onChange([...items, '']);
    };

    const updateItem = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => updateItem(index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add {label}
                </button>
            </div>
        </div>
    );
};

interface RiskEditorProps {
    risks: Array<{ risk: string; mitigation: string }>;
    onChange: (risks: Array<{ risk: string; mitigation: string }>) => void;
}

export const RiskEditor: React.FC<RiskEditorProps> = ({ risks, onChange }) => {
    const addRisk = () => {
        onChange([...risks, { risk: '', mitigation: '' }]);
    };

    const updateRisk = (index: number, field: 'risk' | 'mitigation', value: string) => {
        const newRisks = [...risks];
        newRisks[index][field] = value;
        onChange(newRisks);
    };

    const removeRisk = (index: number) => {
        onChange(risks.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Flags
            </label>
            <div className="space-y-4">
                {risks.map((risk, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">Risk #{index + 1}</span>
                            <button
                                onClick={() => removeRisk(index)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={risk.risk}
                            onChange={(e) => updateRisk(index, 'risk', e.target.value)}
                            placeholder="Risk description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            value={risk.mitigation}
                            onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                            placeholder="Mitigation strategy..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                ))}
                <button
                    onClick={addRisk}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Risk Flag
                </button>
            </div>
        </div>
    );
};
