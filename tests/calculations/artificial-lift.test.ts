import { describe, it, expect } from 'vitest';
import {
  calculateEspSizing,
  calculateGasLift,
} from '@/lib/calculations/production/artificial-lift';

describe('Artificial Lift Sizing Engine', () => {
  it('calculates ESP TDH, stages, and motor horsepower accurately', () => {
    const res = calculateEspSizing({
      targetFlowRate: 2500, // STB/d
      pumpSettingDepthTVD: 7500, // ft
      tubingInnerDiameter: 2.875,
      wellheadPressure: 250,
      pumpIntakePressure: 800,
      fluidSpecificGravity: 0.88,
      headPerStage: 45,
    });

    expect(res.totalDynamicHeadFt).toBeGreaterThan(5000);
    expect(res.numberOfStages).toBeGreaterThan(100);
    expect(res.brakeHorsepower).toBeGreaterThan(50);
  });

  it('calculates continuous gas lift injection depth and gas requirements', () => {
    const res = calculateGasLift({
      oilRate: 1500,
      formationGor: 300,
      targetGlr: 800,
      wellheadPressure: 200,
      availableGasPressure: 1200,
      depthTVD: 8000,
    });

    expect(res.injectionDepthTVD).toBeGreaterThan(2000);
    // Delta GLR = 800 - 300 = 500 scf/stb -> Q_inj = 1500 * 500 / 1000 = 750 Mscf/d
    expect(res.requiredGasRateMscfd).toBe(750);
  });
});
