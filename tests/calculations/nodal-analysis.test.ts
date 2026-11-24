import { describe, it, expect } from 'vitest';
import {
  calculateIprPwf,
  calculateAofp,
  runNodalAnalysis,
} from '@/lib/calculations/production/nodal-analysis';

describe('Nodal Analysis Engine (Inflow / Outflow)', () => {
  const inflow = {
    reservoirPressure: 4000,     // Pr in psi
    bubblePointPressure: 3000,   // Pb in psi
    productivityIndex: 2.0,      // PI in STB/d/psi
  };

  const outflow = {
    wellheadPressure: 300,
    tubingInnerDiameter: 2.875,
    depthTVD: 8000,
  };

  it('calculates Darcy undersaturated flow above bubble point', () => {
    // q = PI * (Pr - Pwf) -> for q = 1000 STB/d, Pwf = 4000 - 1000/2 = 3500 psi (> Pb)
    const pwf = calculateIprPwf(1000, inflow);
    expect(pwf).toBe(3500);
  });

  it('calculates Vogel two-phase flow below bubble point', () => {
    // At bubble point (Pwf = 3000), qb = 2 * (4000 - 3000) = 2000 STB/d
    const pwfAtPb = calculateIprPwf(2000, inflow);
    expect(pwfAtPb).toBeCloseTo(3000, 0);

    // Below Pb, flowrate increases as Pwf drops
    const pwfHigherQ = calculateIprPwf(3000, inflow);
    expect(pwfHigherQ).toBeLessThan(3000);
  });

  it('calculates AOFP and solves operating point intersection via Bisection', () => {
    const aofp = calculateAofp(inflow);
    expect(aofp).toBeGreaterThan(4000);

    const result = runNodalAnalysis(inflow, outflow);
    expect(result.aofp).toBe(aofp);
    expect(result.curves.length).toBeGreaterThan(0);
    expect(result.operatingPoint).not.toBeNull();
    if (result.operatingPoint) {
      expect(result.operatingPoint.flowRate).toBeGreaterThan(500);
      expect(result.operatingPoint.bottomholePressure).toBeGreaterThan(300);
    }
  });
});
