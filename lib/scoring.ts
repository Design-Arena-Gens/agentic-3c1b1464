import { Company, ScoredCompany, UserPreferences } from './types';

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

function normalize(value: number, min: number, max: number, invert = false): number {
  if (max === min) return 0.5;
  const v = clamp01((value - min) / (max - min));
  return invert ? 1 - v : v;
}

function marketCapFactor(marketCapCr: number, includeLargeCaps: boolean): number {
  if (marketCapCr < 5000) return 1; // small/micro
  if (marketCapCr < 20000) return 0.9; // small-mid
  if (marketCapCr < 50000) return 0.75; // mid
  if (!includeLargeCaps && marketCapCr >= 50000) return 0.45;
  return 0.6; // large-cap allowed but dampened
}

function sectorPreferenceBoost(sector: string, prefs: string[]): number {
  if (prefs.length === 0) return 1;
  return prefs.includes(sector) ? 1.08 : 0.96;
}

function riskAdjustment(base: number, riskTolerance: UserPreferences['riskTolerance'], debtToEquity: number): number {
  // Penalize high leverage for low risk tolerance; slightly reward for high risk tolerance if growth is strong
  const leveragePenalty = debtToEquity > 1 ? (riskTolerance === 'low' ? 0.85 : riskTolerance === 'medium' ? 0.92 : 0.97) : 1;
  return base * leveragePenalty;
}

export function scoreCompany(c: Company, prefs: UserPreferences): ScoredCompany {
  const growth = 0.30 * normalize(c.revenueCagr5yPct, 0, 40) +
                 0.20 * normalize(c.profitCagr5yPct, 0, 40) +
                 0.05 * normalize(c.freeCashFlowCagr5yPct ?? c.profitCagr5yPct, 0, 40);

  const quality = 0.20 * normalize(c.rocePct, 8, 35) +
                  0.07 * normalize(c.operatingMarginPct, 5, 35) +
                  0.08 * normalize(c.debtToEquity, 0, 2, true) +
                  0.05 * normalize(c.promoterHoldingPct, 40, 80);

  const valuation = 0.03 * normalize(c.priceToSales, 0.5, 12, true) +
                    0.02 * normalize(c.priceToEarnings, 8, 60, true);

  const base = (growth + quality + valuation); // roughly 0..1

  const size = marketCapFactor(c.marketCapCr, prefs.includeLargeCaps);
  const sectorBoost = sectorPreferenceBoost(c.sector, prefs.preferredSectors);
  const riskAdj = riskAdjustment(1, prefs.riskTolerance, c.debtToEquity);

  const score01 = clamp01(base * size * sectorBoost * riskAdj);
  const score = Math.round(score01 * 100);

  const rationale = makeRationale(c, score);

  return { ...c, score, rationale };
}

function makeRationale(c: Company, score: number): string {
  const parts: string[] = [];
  if (c.revenueCagr5yPct >= 20 || c.profitCagr5yPct >= 20) parts.push('tez growth trajectory');
  if (c.rocePct >= 20) parts.push('majboot ROCE');
  if (c.debtToEquity <= 0.5) parts.push('nimn leverage');
  if (c.promoterHoldingPct >= 60) parts.push('uchch promoter holding');
  if (c.priceToSales <= 3 || c.priceToEarnings <= 20) parts.push('sangat valuation');
  if (c.operatingMarginPct >= 20) parts.push('healthy margins');
  if (c.marketCapCr < 20000) parts.push('small/mid-cap optionality');

  const headline = score >= 80 ? 'Uchch sambhavana' : score >= 65 ? 'Sakaratmak drishtikon' : 'Neutral profile';
  return `${headline}: ${parts.join(', ')}`;
}

export function rankCompanies(companies: Company[], prefs: UserPreferences, topN = 5): ScoredCompany[] {
  return companies
    .map(c => scoreCompany(c, prefs))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
