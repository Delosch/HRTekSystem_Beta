export type EngineType =
  | 'hcm-vendor-fit'
  | 'ai-maturity'
  | 'roadmap'
  | 'icms'
  | 'shared-services'
  | 'hti'
  | 'profiling-assessment';

export interface PricingInput {
  engine: EngineType;
  employeeCount: number;
  months?: number; // Only for ICMS, Shared Services, HTI
}

export interface PricingResult {
  basePrice: number;
  gst: number;
  totalPrice: number;
  employeeTier: string;
  perUserPrice: number;
}

const PRICING_TABLE = [
  { scale: 'Small Scale', range: [0, 500], hcm: 275000, icms: 625000, hti: 4000000, pUserHcm: 550, pUserIcms: 1250, pUserHti: 8000 },
  { scale: 'Small Scale', range: [501, 1000], hcm: 550000, icms: 1250000, hti: 8000000, pUserHcm: 550, pUserIcms: 1250, pUserHti: 8000 },
  { scale: 'Small Scale', range: [1001, 2000], hcm: 1100000, icms: 2500000, hti: 16000000, pUserHcm: 550, pUserIcms: 1250, pUserHti: 8000 },
  { scale: 'Mid Size', range: [2001, 3000], hcm: 1950000, icms: 4500000, hti: 30000000, pUserHcm: 650, pUserIcms: 1500, pUserHti: 10000 },
  { scale: 'Mid Size', range: [3001, 4000], hcm: 2600000, icms: 6000000, hti: 40000000, pUserHcm: 650, pUserIcms: 1500, pUserHti: 10000 },
  { scale: 'Mid Size', range: [4001, 5000], hcm: 3250000, icms: 7500000, hti: 50000000, pUserHcm: 650, pUserIcms: 1500, pUserHti: 10000 },
  { scale: 'Mid Size', range: [5001, 7500], hcm: 4875000, icms: 11250000, hti: 75000000, pUserHcm: 650, pUserIcms: 1500, pUserHti: 10000 },
  { scale: 'Large Scale', range: [7501, 10000], hcm: 7500000, icms: 18500000, hti: 120000000, pUserHcm: 750, pUserIcms: 1850, pUserHti: 12000 },
  { scale: 'Large Scale', range: [10001, 15000], hcm: 11250000, icms: 27750000, hti: 180000000, pUserHcm: 750, pUserIcms: 1850, pUserHti: 12000 },
  { scale: 'Large Scale', range: [15001, 20000], hcm: 15000000, icms: 37000000, hti: 240000000, pUserHcm: 750, pUserIcms: 1850, pUserHti: 12000 },
  { scale: 'Enterprise level', range: [20001, 30000], hcm: 25500000, icms: 64500000, hti: 420000000, pUserHcm: 850, pUserIcms: 2150, pUserHti: 14000 },
  { scale: 'Enterprise level', range: [30001, 40000], hcm: 34000000, icms: 86000000, hti: 560000000, pUserHcm: 850, pUserIcms: 2150, pUserHti: 14000 },
  { scale: 'Enterprise level', range: [40001, 50000], hcm: 42500000, icms: 107500000, hti: 700000000, pUserHcm: 850, pUserIcms: 2150, pUserHti: 14000 },
  { scale: 'Coglomorates', range: [50001, 70000], hcm: 66500000, icms: 175000000, hti: 1260000000, pUserHcm: 950, pUserIcms: 2500, pUserHti: 18000 },
  { scale: 'Coglomorates', range: [70001, 100000], hcm: 95000000, icms: 250000000, hti: 1800000000, pUserHcm: 950, pUserIcms: 2500, pUserHti: 18000 },
  { scale: 'Coglomorates', range: [100001, 150000], hcm: 142500000, icms: 375000000, hti: 2700000000, pUserHcm: 950, pUserIcms: 2500, pUserHti: 18000 },
  { scale: 'Coglomorates', range: [150001, 1000000], hcm: 190000000, icms: 500000000, hti: 3600000000, pUserHcm: 950, pUserIcms: 2500, pUserHti: 18000 },
];

export function calculatePricing({ engine, employeeCount, months = 1 }: PricingInput): PricingResult {
  const tier = PRICING_TABLE.find(t => employeeCount >= t.range[0] && employeeCount <= t.range[1])
    || PRICING_TABLE[0];

  let baseRate = 0;
  let perUser = 0;
  
  switch (engine) {
    case 'profiling-assessment':
      baseRate = 45000;
      perUser = 0;
      break;
    case 'hcm-vendor-fit':
    case 'ai-maturity':
    case 'roadmap':
      baseRate = tier.hcm;
      perUser = tier.pUserHcm;
      break;
    case 'icms':
    case 'shared-services':
      baseRate = tier.icms * months;
      perUser = tier.pUserIcms;
      break;
    case 'hti':
      baseRate = tier.hti * months;
      perUser = tier.pUserHti;
      break;
  }

  const gst = baseRate * 0.18;
  const total = baseRate + gst;

  return {
    basePrice: baseRate,
    gst: gst,
    totalPrice: total,
    employeeTier: `${tier.scale} (${tier.range[0].toLocaleString()}-${tier.range[1] === 1000000 ? '200,000+' : tier.range[1].toLocaleString()})`,
    perUserPrice: perUser
  };
}

export function getEmployeeTiers() {
  return PRICING_TABLE.map(t => ({
    label: `${t.scale}: ${t.range[0].toLocaleString()} - ${t.range[1] === 1000000 ? '200,000+' : t.range[1].toLocaleString()} Employees`,
    min: t.range[0],
    max: t.range[1]
  }));
}
