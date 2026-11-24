/**
 * Drilling Hydraulics, Hydrostatic Pressure & ECD Engine.
 * SPE Drilling Formulations in standard Field Units.
 */

export interface HydraulicsInput {
  trueVerticalDepth: number;     // TVD in ft
  measuredDepth: number;          // MD in ft
  currentMudWeight: number;       // MW in ppg
  flowRateGpm: number;            // Q in GPM (e.g. 500 GPM)
  annularPressureLoss?: number;   // APL in psi (default computed from flow parameters)
  leakOffTestEmw: number;         // LOT in ppg (Fracture gradient limit)
  porePressureEmw?: number;       // EMW in ppg
  holeDiameterInches?: number;    // Bit size in inches (e.g. 8.5)
  drillpipeOuterDiameter?: number;// DP OD in inches (e.g. 5.0)
}

export interface PressureProfilePoint {
  depthTvd: number;
  hydrostaticPressure: number;    // psi
  circulatingPressure: number;    // psi (Hydrostatic + Annular loss)
  equivalentMudWeight: number;    // ppg (ECD)
  fractureLimitPressure: number;  // psi
}

export interface HydraulicsResult {
  hydrostaticPressureBottomPsi: number;
  annularPressureLossPsi: number;
  equivalentCirculatingDensityPpg: number;
  fractureMarginPpg: number;      // LOT_EMW - ECD (Kick tolerance buffer)
  isWithinSafeMargin: boolean;
  pressureProfile: PressureProfilePoint[];
}

export function calculateDrillingHydraulics(input: HydraulicsInput): HydraulicsResult {
  const {
    trueVerticalDepth: tvd,
    measuredDepth: md,
    currentMudWeight: mw,
    flowRateGpm: qGpm,
    annularPressureLoss,
    leakOffTestEmw: lot,
    porePressureEmw = mw - 0.5,
    holeDiameterInches = 8.5,
    drillpipeOuterDiameter = 5.0,
  } = input;

  if (tvd <= 0 || mw <= 0) throw new Error('TVD and mud weight must be positive.');
  if (tvd > md) throw new Error('True vertical depth (TVD) cannot exceed measured depth (MD).');

  // Hydrostatic pressure at bottomhole: Ph = 0.052 * MW * TVD
  const phBottom = 0.052 * mw * tvd;

  // Annular Pressure Loss (APL) if not explicitly supplied:
  // Empirical turbulent flow in annulus: APL ~ (1.43e-7 * rho * L * v^2) / (Dh - Dp)
  let apl = annularPressureLoss;
  if (apl === undefined) {
    const dh = holeDiameterInches;
    const dp = drillpipeOuterDiameter;
    const annularArea = (Math.PI / 4) * (dh * dh - dp * dp); // sq inches
    const annularVelocityFtMin = (qGpm * 19.25) / annularArea; // ft/min
    // Annular loss psi:
    apl = ((0.00001 * mw * Math.pow(annularVelocityFtMin, 1.8)) / Math.pow(dh - dp, 1.2)) * (md / 1000);
  }

  // Equivalent Circulating Density: ECD = MW + APL / (0.052 * TVD)
  const ecd = mw + apl / (0.052 * tvd);
  const fractureMargin = lot - ecd;
  const isSafe = fractureMargin > 0;

  // Generate depth profile (10 steps)
  const profileSteps = 10;
  const pressureProfile: PressureProfilePoint[] = [];

  for (let i = 0; i <= profileSteps; i++) {
    const depth = (i / profileSteps) * tvd;
    const hydP = 0.052 * mw * depth;
    const aplAtDepth = depth > 0 ? (depth / tvd) * apl : 0;
    const circP = hydP + aplAtDepth;
    const ecdAtDepth = depth > 0 ? mw + aplAtDepth / (0.052 * depth) : mw;
    const fracLimitP = 0.052 * lot * depth;

    pressureProfile.push({
      depthTvd: Math.round(depth),
      hydrostaticPressure: Math.round(hydP),
      circulatingPressure: Math.round(circP),
      equivalentMudWeight: Number(ecdAtDepth.toFixed(2)),
      fractureLimitPressure: Math.round(fracLimitP),
    });
  }

  return {
    hydrostaticPressureBottomPsi: Math.round(phBottom),
    annularPressureLossPsi: Math.round(apl),
    equivalentCirculatingDensityPpg: Number(ecd.toFixed(2)),
    fractureMarginPpg: Number(fractureMargin.toFixed(2)),
    isWithinSafeMargin: isSafe,
    pressureProfile,
  };
}
