import { describe, it, expect } from 'vitest';
import {
  calculateArpsRate,
  calculateArpsCumulative,
  runDcaAnalysis,
} from '@/lib/calculations/reservoir/dca';

describe('Arps Decline Curve Analysis Engine', () => {
  const qi = 1000; // STB/d
  const Di = 0.20; // 20% / yr

  it('calculates exponential decline accurately and falls back when b = 0', () => {
    // q(1) = 1000 * exp(-0.20 * 1) = 818.73 STB/d
    const q1 = calculateArpsRate(qi, Di, 0.0, 1.0);
    expect(q1).toBeCloseTo(818.73, 1);

    // Fallback safeguard when b is near zero (< 1e-6)
    const qNearZero = calculateArpsRate(qi, Di, 1e-7, 1.0);
    expect(qNearZero).toBeCloseTo(818.73, 1);
  });

  it('calculates harmonic decline accurately (b = 1)', () => {
    // q(1) = 1000 / (1 + 0.20 * 1) = 833.33 STB/d
    const qHarm = calculateArpsRate(qi, Di, 1.0, 1.0);
    expect(qHarm).toBeCloseTo(833.33, 1);
  });

  it('calculates hyperbolic decline accurately (0 < b < 1)', () => {
    // b = 0.5: q(1) = 1000 / (1 + 0.5 * 0.20 * 1)^(1 / 0.5) = 1000 / (1.1)^2 = 826.45 STB/d
    const qHyp = calculateArpsRate(qi, Di, 0.5, 1.0);
    expect(qHyp).toBeCloseTo(826.45, 1);
  });

  it('calculates EUR and forecast series in runDcaAnalysis', () => {
    const res = runDcaAnalysis({
      initialRate: 1200,
      initialDeclineNominal: 0.25,
      bFactor: 0.4,
      economicLimitRate: 50,
      forecastYears: 10,
    });

    expect(res.declineModelUsed).toBe('HYPERBOLIC');
    expect(res.timeToEconomicLimitYears).toBeGreaterThan(5);
    expect(res.estimatedUltimateRecovery).toBeGreaterThan(100000);
    expect(res.forecastSeries.length).toBeGreaterThan(0);
  });
});
