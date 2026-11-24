import { describe, it, expect } from 'vitest';
import { runHavlenaOdehAnalysis } from '@/lib/calculations/reservoir/material-balance';

describe('Material Balance Havlena-Odeh Engine', () => {
  it('solves linear regression to estimate OOIP from expansion and withdrawal', () => {
    // Synthetic data for volumetric undersaturated depletion reservoir
    const dataPoints = [
      {
        pressure: 4000, // Initial Pi
        cumulativeOil: 0,
        bo: 1.250,
        rs: 600,
        bg: 0.001,
      },
      {
        pressure: 3800,
        cumulativeOil: 250000,
        bo: 1.265,
        rs: 600,
        bg: 0.0011,
      },
      {
        pressure: 3600,
        cumulativeOil: 520000,
        bo: 1.280,
        rs: 600,
        bg: 0.0012,
      },
      {
        pressure: 3400,
        cumulativeOil: 810000,
        bo: 1.298,
        rs: 600,
        bg: 0.0013,
      },
    ];

    const res = runHavlenaOdehAnalysis({
      initialPressure: 4000,
      initialBo: 1.250,
      initialRs: 600,
      initialBg: 0.001,
      dataPoints,
    });

    expect(res.estimatedOOIP).toBeGreaterThan(1000000);
    expect(res.diagnosticSeries.length).toBe(4);
    expect(res.rSquared).toBeGreaterThan(0.9);
  });
});
