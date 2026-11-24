import { describe, it, expect } from 'vitest';
import { calculateDrillingHydraulics } from '@/lib/calculations/drilling/hydraulics';

describe('Drilling Hydraulics & ECD Engine', () => {
  it('calculates hydrostatic pressure and ECD accurately', () => {
    // TVD = 10,000 ft, MW = 10.0 ppg -> Ph = 0.052 * 10.0 * 10000 = 5200 psi
    const res = calculateDrillingHydraulics({
      trueVerticalDepth: 10000,
      measuredDepth: 11000,
      currentMudWeight: 10.0,
      flowRateGpm: 500,
      annularPressureLoss: 250, // psi
      leakOffTestEmw: 13.5, // ppg LOT
    });

    expect(res.hydrostaticPressureBottomPsi).toBe(5200);
    // ECD = 10.0 + 250 / (0.052 * 10000) = 10.0 + 0.48 = 10.48 ppg
    expect(res.equivalentCirculatingDensityPpg).toBeCloseTo(10.48, 2);
    // Fracture margin = 13.5 - 10.48 = 3.02 ppg
    expect(res.fractureMarginPpg).toBeCloseTo(3.02, 2);
    expect(res.isWithinSafeMargin).toBe(true);
    expect(res.pressureProfile.length).toBe(11);
  });

  it('rejects TVD > MD', () => {
    expect(() =>
      calculateDrillingHydraulics({
        trueVerticalDepth: 12000,
        measuredDepth: 10000,
        currentMudWeight: 10.0,
        flowRateGpm: 500,
        leakOffTestEmw: 13.0,
      })
    ).toThrow();
  });
});
