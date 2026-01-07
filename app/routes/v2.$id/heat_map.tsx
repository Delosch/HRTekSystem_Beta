import React from "react";

export interface Capability {
  name: string;
  score: number;
  color_intensity?: number; // This is calculated for the heatmap
}

export interface DimensionMatrix {
  name: string;
  capabilities: Capability[];
}

export interface ColorScale {
  min_color: string;
  mid_color: string;
  max_color: string;
}

export interface HeatmapDataConfig {
  matrix: DimensionMatrix[];
  color_scale: ColorScale;
}

export interface HeatmapCellData {
  x: string; // Dimension name
  y: string; // Capability name
  value?: number; // Score (may be undefined if missing)
  colorIntensity: number;
}

export interface HeatmapMatrix {
  data: HeatmapCellData[];
  xLabels: string[]; // Dimensions
  yLabels: string[]; // Capabilities
  colorScale: ColorScale;
}

export const getHeatmapMatrix = (heatmapDataConfig: HeatmapDataConfig) => {
  console.log("heatmap ", heatmapDataConfig)
  const matrix = heatmapDataConfig.matrix;
  const colorScale = heatmapDataConfig.color_scale;

  const allCapabilities: (Capability & { dimension: string })[] = [];
  matrix.forEach(dim => {
    dim.capabilities.forEach(cap => {
      allCapabilities.push({ ...cap, dimension: dim.name }); // Use dim.name
    });
  });

  const dimensions = Array.from(new Set(allCapabilities.map(d => d.dimension)));
  const capabilities = Array.from(new Set(allCapabilities.map(d => d.name))).sort();

  const dataGrid: HeatmapCellData[] = [];
  dimensions.forEach(dim => {
    capabilities.forEach(cap => {
      const foundCap = allCapabilities.find(
        (item) => item.dimension === dim && item.name === cap
      );
      dataGrid.push({
        x: dim,
        y: cap,
        value: foundCap?.score || undefined,
        colorIntensity: foundCap?.color_intensity || 0,
      });
    });
  });

  return { data: dataGrid, xLabels: dimensions, yLabels: capabilities, colorScale };
};

const getHeatmapCellColor = (intensity: number, colorScale: ColorScale): string => {
  if (!intensity) return 'rgba(255,255,255,0.05)'; // Empty cell
  if (intensity === 1) return '#10b981'; // Emerald (Excellent)
  if (intensity === 2) return '#2dd4bf'; // Teal (Strong)
  if (intensity === 3) return '#6366f1'; // Indigo (Moderate) - Overriding scale for cleaner theme
  if (intensity === 4) return '#f59e0b'; // Amber (Developing)
  if (intensity >= 5) return '#f43f5e'; // Rose (Critical)
  return 'rgba(255,255,255,0.05)';
};

interface HeatmapCellProps {
  value?: number;
  intensity: number;
  colorScale: ColorScale;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({ value, intensity, colorScale }) => {
  const bgColor = getHeatmapCellColor(intensity, colorScale);
  const textColor = 'text-white';

  return (
    <div
      className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 hover:z-10 rounded-sm relative`}
      style={{ backgroundColor: bgColor, minWidth: '80px', minHeight: '40px' }}
    >
      <span className={`${textColor} font-bold text-lg drop-shadow-md`}>
        {value !== undefined ? value.toFixed(1) : ''}
      </span>
    </div>
  );
};

interface HeatmapProps {
  data: HeatmapMatrix;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const { data: dataGrid, xLabels, yLabels, colorScale } = data;

  const getCellValue = (x: string, y: string) => {
    return dataGrid.find(d => d.x === x && d.y === y);
  };

  return (
    <div className="overflow-x-auto p-4 bg-transparent rounded-lg">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(120px, 1fr))` }}>
        {/* Corner empty cell */}
        <div />
        {/* X-axis labels (Dimensions) */}
        {xLabels.map((label, idx) => (
          <div key={idx} className="p-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight break-words" style={{ minWidth: '120px' }}>
            {label}
          </div>
        ))}

        {/* Y-axis labels (Capabilities) and data cells */}
        {yLabels.map((yLabel, yIdx) => (
          <React.Fragment key={yIdx}>
            <div className="p-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider break-words flex items-center justify-end" style={{ minHeight: '40px' }}>
              {yLabel}
            </div>
            {xLabels.map((xLabel, xIdx) => {
              const cellData = getCellValue(xLabel, yLabel);
              return (
                <div key={`${xIdx}-${yIdx}`} className="group relative border border-white/5 bg-slate-800/50">
                  {cellData && cellData.value !== undefined ? (
                    <HeatmapCell
                      value={cellData.value}
                      intensity={cellData.colorIntensity}
                      colorScale={colorScale}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900/50" style={{ minWidth: '80px', minHeight: '40px' }}></div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 flex justify-center flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-300">
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>Critical</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>Developing</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>Moderate</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>Strong</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>Excellent</span>
      </div>
    </div>
  );
};