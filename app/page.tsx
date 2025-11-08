"use client";
import { useMemo, useState } from 'react';

type Result = {
  name: string;
  ticker: string;
  sector: string;
  score: number;
  rationale: string;
  marketCapCr: number;
  revenueCagr5yPct: number;
  profitCagr5yPct: number;
  rocePct: number;
  operatingMarginPct: number;
  debtToEquity: number;
  promoterHoldingPct: number;
  priceToSales: number;
  priceToEarnings: number;
};

export default function Page() {
  const [riskTolerance, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [preferredSectors, setSectors] = useState<string[]>([]);
  const [includeLargeCaps, setIncludeLarge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState('');

  const allSectors = useMemo(() => (
    ['IT', 'Auto', 'Pharma', 'Chemical', 'Consumer', 'Banking', 'Capital Goods', 'Renewables', 'Logistics', 'Infra']
  ), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskTolerance, preferredSectors, includeLargeCaps }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setResults(json.results);
      setDisclaimer(json.disclaimer);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function toggleSector(sector: string) {
    setSectors(s => s.includes(sector) ? s.filter(x => x !== sector) : [...s, sector]);
  }

  return (
    <div className="container">
      <div className="card" style={{marginBottom: 16}}>
        <div className="badge">AI Multibagger Shodh (Bharat)</div>
        <h1 className="h1">Kaun si Indian company multi-bagger ban sakti hai?</h1>
        <p className="muted">Aapke risk profile aur sector pasand ke aadhar par ummeedwar company sujhav. <strong>Yah financial advice nahi hai.</strong></p>
        <form className="grid" onSubmit={onSubmit} style={{marginTop: 12}}>
          <div className="row">
            <div className="col-4">
              <label className="small">Risk Tolerance</label>
              <select value={riskTolerance} onChange={e => setRisk(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="col-4">
              <label className="small">Large-caps ko shamil karein?</label>
              <select value={includeLargeCaps ? 'yes' : 'no'} onChange={e => setIncludeLarge(e.target.value === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="col-4">
              <label className="small">Sectors (0-3 chun sakte hain)</label>
              <div className="list">
                {allSectors.map(sec => (
                  <label key={sec} className="small" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <input type="checkbox" checked={preferredSectors.includes(sec)} onChange={() => toggleSector(sec)} /> {sec}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <button className="button" disabled={loading}>
              {loading ? 'Calculating?' : 'Predict Candidates'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="item" style={{borderColor: '#a33'}}>{error}</div>}

      {results.length > 0 && (
        <div className="card">
          <div className="badge">Top Candidates</div>
          <div className="list" style={{marginTop: 12}}>
            {results.map(r => (
              <div key={r.ticker} className="item">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <div>
                    <strong>{r.name}</strong> <span className="muted">({r.ticker}) ? {r.sector}</span>
                  </div>
                  <div className="badge">Score: {r.score}</div>
                </div>
                <div className="scoreBar" style={{marginTop: 8}}>
                  <div className="scoreFill" style={{width: `${r.score}%`}} />
                </div>
                <div className="small" style={{marginTop: 8}}>{r.rationale}</div>
                <div className="small" style={{marginTop: 6}}>
                  MCap: ?{r.marketCapCr.toLocaleString()} Cr ? ROCE: {r.rocePct}% ? OPM: {r.operatingMarginPct}% ? D/E: {r.debtToEquity}
                </div>
                <div className="small">Rev CAGR: {r.revenueCagr5yPct}% ? Profit CAGR: {r.profitCagr5yPct}% ? P/S: {r.priceToSales} ? P/E: {r.priceToEarnings}</div>
              </div>
            ))}
          </div>
          <footer>
            {disclaimer}
          </footer>
        </div>
      )}
    </div>
  );
}
