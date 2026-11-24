import { describe, it, expect } from 'vitest';
import { calculateKillSheet } from '@/lib/calculations/drilling/kill-sheet';

describe('Well Control Kill Sheet Engine (Wait & Weight)', () => {
  it('calculates KMW, ICP, FCP, and step-down schedule accurately', () => {
    // TVD = 10,000 ft, OMW = 10.0 ppg, SIDPP = 500 psi, SICP = 700 psi, SCR = 800 psi @ 30 SPM
    // KMW = 10.0 + 500 / (0.052 * 10000) = 10.0 + 0.9615 = 10.96 ppg
    // ICP = 500 + 800 = 1300 psi
    // FCP = 800 * (10.9615 / 10.0) = 876.9 psi ~ 877 psi
    const res = calculateKillSheet({
      trueVerticalDepth: 10000,
      measuredDepth: 10500,
      currentMudWeight: 10.0,
      sidpp: 500,
      sicp: 700,
      slowCirculatingPressure: 800,
      slowCirculatingRateSpm: 30,
      drillpipeCapacity: 0.01776,
      pumpOutputBblPerStroke: 0.119,
    });

    expect(res.killMudWeightPpg).toBeCloseTo(10.96, 1);
    expect(res.initialCirculatingPressurePsi).toBe(1300);
    expect(res.finalCirculatingPressurePsi).toBeCloseTo(877, 0);
    expect(res.strokesToBit).toBeGreaterThan(1000);
    expect(res.stepDownSchedule.length).toBe(11);
    // At step 0, pressure must equal ICP
    expect(res.stepDownSchedule[0].drillpipePressure).toBe(1300);
    // At last step, pressure must equal FCP
    expect(res.stepDownSchedule[10].drillpipePressure).toBe(res.finalCirculatingPressurePsi);
  });
});
