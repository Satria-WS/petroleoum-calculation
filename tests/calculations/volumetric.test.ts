import { describe, it, expect } from 'vitest';
import {
  calculateDeterministicOOIP,
  calculateDeterministicOGIP,
  runMonteCarloVolumetric,
} from '@/lib/calculations/reservoir/volumetric';

describe('Volumetric Reserve & Monte Carlo Engine', () => {
  it('calculates deterministic OOIP accurately based on SPE formula', () => {
    // Area = 640 acres, h = 100 ft, phi = 0.20, Sw = 0.25, Boi = 1.25 bbl/STB
    // OOIP = (7758 * 640 * 100 * 0.20 * 0.75) / 1.25 = 59,581,440 STB
    const res = calculateDeterministicOOIP({
      area: 640,
      thickness: 100,
      porosity: 0.20,
      waterSaturation: 0.25,
      formationVolumeFactor: 1.25,
      recoveryFactor: 0.35,
    });

    expect(res.originalInPlace).toBe(59581440);
    expect(res.recoverableReserves).toBe(Math.round(59581440 * 0.35));
  });

  it('calculates deterministic OGIP accurately', () => {
    // Area = 640 acres, h = 50 ft, phi = 0.15, Sw = 0.30, Bgi = 0.005 ft3/scf
    // OGIP = (43560 * 640 * 50 * 0.15 * 0.70) / 0.005 = 29,272,320,000 SCF
    const res = calculateDeterministicOGIP({
      area: 640,
      thickness: 50,
      porosity: 0.15,
      waterSaturation: 0.30,
      formationVolumeFactor: 0.005,
      recoveryFactor: 0.75,
    });

    expect(res.originalInPlace).toBe(29272320000);
  });

  it('enforces physical boundary conditions (rejects impossible inputs)', () => {
    expect(() =>
      calculateDeterministicOOIP({
        area: 640,
        thickness: 100,
        porosity: 1.2, // > 1
        waterSaturation: 0.25,
        formationVolumeFactor: 1.25,
      })
    ).toThrow();
  });

  it('executes reproducible Monte Carlo simulation with seed', () => {
    const input = {
      area: { type: 'TRIANGULAR' as const, min: 500, mode: 640, max: 800 },
      thickness: { type: 'TRIANGULAR' as const, min: 60, mode: 80, max: 100 },
      porosity: { type: 'NORMAL' as const, mean: 0.22, stdDev: 0.02 },
      waterSaturation: { type: 'UNIFORM' as const, min: 0.2, max: 0.3 },
      formationVolumeFactor: { type: 'TRIANGULAR' as const, min: 1.15, mode: 1.25, max: 1.35 },
      recoveryFactor: { type: 'TRIANGULAR' as const, min: 0.25, mode: 0.35, max: 0.45 },
      fluidType: 'OIL' as const,
      numTrials: 2000,
      seed: 42,
    };

    const run1 = runMonteCarloVolumetric(input);
    const run2 = runMonteCarloVolumetric(input);

    // Deterministic reproducibility: same seed yields identical outputs
    expect(run1.p90).toBe(run2.p90);
    expect(run1.p50).toBe(run2.p50);
    expect(run1.p10).toBe(run2.p10);
    expect(run1.p90).toBeLessThan(run1.p50);
    expect(run1.p50).toBeLessThan(run1.p10);
    expect(run1.histogram.length).toBe(25);
    expect(run1.cdf.length).toBeGreaterThan(10);
  });
});
