export type RiskTolerance = 'low' | 'medium' | 'high';

export type UserPreferences = {
  riskTolerance: RiskTolerance;
  preferredSectors: string[];
  includeLargeCaps: boolean;
};

export type Company = {
  name: string;
  ticker: string;
  sector: string;
  marketCapCr: number; // INR crores
  revenueCagr5yPct: number;
  profitCagr5yPct: number;
  freeCashFlowCagr5yPct?: number;
  rocePct: number;
  operatingMarginPct: number;
  debtToEquity: number;
  promoterHoldingPct: number;
  priceToSales: number;
  priceToEarnings: number;
  exportsSharePct?: number;
};

export type ScoredCompany = Company & {
  score: number; // 0..100
  rationale: string;
};
