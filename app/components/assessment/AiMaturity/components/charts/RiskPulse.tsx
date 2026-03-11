
import React from 'react';
import { motion } from 'framer-motion';

type RiskLevel = 'low' | 'medium' | 'high';

export const RiskPulse = ({ level }: { level: RiskLevel }) => {
  const getColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getLabel = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'Stable';
      case 'medium':
        return 'At Risk';
      case 'high':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex h-3 w-3">
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inline-flex h-full w-full rounded-full ${getColor(level)} opacity-75`}
        ></motion.span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${getColor(level)}`}></span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{getLabel(level)}</span>
    </div>
  );
};

