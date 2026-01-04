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

  const dataGrid : HeatmapCellData[] = [];
  dimensions.forEach(dim => {
    capabilities.forEach(cap => {
      const foundCap = allCapabilities.find(
        (item) => item.dimension === dim && item.name === cap
      );
      dataGrid.push({
        x: dim,
        y: cap,
        value: foundCap?.score || undefined,
        colorIntensity: foundCap?.color_intensity||0 ,
      });
    });
  });

  return { data: dataGrid, xLabels: dimensions, yLabels: capabilities, colorScale };
};

const getHeatmapCellColor = (intensity: number, colorScale: ColorScale): string  => {
  if (!intensity) return '#f3f4f6'; // bg-gray-200 for empty cells
  if (intensity === 1) return colorScale.max_color; // Excellent
  if (intensity === 2) return '#2dd4bf'; // A teal color for "Strong"
  if (intensity === 3) return colorScale.mid_color; // Moderate
  if (intensity === 4) return '#fb923c'; // An orange color for "Developing"
  if (intensity >= 5) return colorScale.min_color; // Critical
  return '#f3f4f6';
};

interface HeatmapCellProps {
  value?: number;
  intensity: number;
  colorScale: ColorScale;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({ value, intensity, colorScale })=> {
  const bgColor = getHeatmapCellColor(intensity, colorScale);
  const textColor = (intensity >=3 && intensity <=4) ? 'text-gray-800' : 'text-white';

  return (
    <div
      className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 hover:z-10 rounded-sm`}
      style={{ backgroundColor: bgColor, minWidth: '80px', minHeight: '40px' }}
    >
      <span className={`${textColor} font-bold text-lg`}>
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

  const getCellValue = (x:string, y:string) => {
    return dataGrid.find(d => d.x === x && d.y === y);
  };

  return (
    <div className="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(120px, 1fr))` }}>
        {/* Corner empty cell */}
        <div />
        {/* X-axis labels (Dimensions) */}
        {xLabels.map((label, idx) => (
          <div key={idx} className="p-2 text-center text-xs font-semibold text-gray-600 leading-tight break-words" style={{ minWidth: '120px' }}>
            {label}
          </div>
        ))}

        {/* Y-axis labels (Capabilities) and data cells */}
        {yLabels.map((yLabel, yIdx) => (
          <React.Fragment key={yIdx}>
            <div className="p-2 text-right text-xs font-semibold text-gray-600 break-words flex items-center justify-end" style={{ minHeight: '40px' }}>
              {yLabel}
            </div>
            {xLabels.map((xLabel, xIdx) => {
              const cellData = getCellValue(xLabel, yLabel);
              return (
                <div key={`${xIdx}-${yIdx}`} className="group relative border border-gray-200">
                  {cellData && cellData.value !== undefined ? (
                     <HeatmapCell
                        value={cellData.value}
                        intensity={cellData.colorIntensity}
                        colorScale={colorScale}
                      />
                  ) : (
                    <div className="w-full h-full bg-gray-100" style={{ minWidth: '80px', minHeight: '40px' }}></div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
       <div className="mt-6 text-black flex justify-center flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colorScale.min_color}}></span>Critical</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#fb923c'}}></span>Developing</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colorScale.mid_color}}></span>Moderate</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#2dd4bf'}}></span>Strong</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colorScale.max_color}}></span>Excellent</span>
      </div>
    </div>
  );
};