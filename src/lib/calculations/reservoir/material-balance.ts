/**
 * Havlena-Odeh Material Balance Analysis Engine.
 * Formulates reservoir drive diagnostics and linear regression for Initial In-Place Reserves (N).
 */

export interface MaterialBalancePoint {
  pressure: number;           // Reservoir pressure (psi)
  cumulativeOil: number;      // Np in STB
  cumulativeGas?: number;     // Gp in Mscf
  cumulativeWater?: number;   // Wp in bbl
  bo: number;                 // Oil formation volume factor (bbl/STB)
  rs: number;                 // Solution gas-oil ratio (scf/STB)
  bg: number;                 // Gas formation volume factor (bbl/scf)
  bw?: number;                // Water FVF (bbl/STB, default 1.0)
}

export interface HavlenaOdehInput {
  initialPressure: number;    // Pi in psi
  initialBo: number;          // Boi in bbl/STB
  initialRs: number;          // Rsi in scf/STB
  initialBg: number;          // Bgi in bbl/scf
  gasCapRatio?: number;       // m = initial gas cap volume / initial oil volume (default 0)
  waterCompressibility?: number; // cw in 1/psi (default 3.0e-6)
  rockCompressibility?: number;  // cf in 1/psi (default 4.0e-6)
  initialWaterSaturation?: number; // Swi (default 0.25)
  dataPoints: MaterialBalancePoint[];
}

export interface HavlenaOdehDiagnosticPoint {
  pressure: number;
  undergroundWithdrawalF: number;   // F in bbl
  oilExpansionEo: number;           // Eo in bbl/STB
  gasExpansionEg: number;           // Eg in bbl/STB
  rockWaterExpansionEfw: number;    // Efw in bbl/STB
  totalExpansionE: number;          // Et = Eo + m*Eg + Efw
  apparentN: number;                // F / Et
}

export interface MaterialBalanceResult {
  estimatedOOIP: number;            // STB (Slope of F vs Et regression)
  rSquared: number;                 // Coefficient of determination
  diagnosticSeries: HavlenaOdehDiagnosticPoint[];
  inferredDriveMechanism: string;
}

export function runHavlenaOdehAnalysis(input: HavlenaOdehInput): MaterialBalanceResult {
  const {
    initialPressure,
    initialBo,
    initialRs,
    initialBg,
    gasCapRatio = 0,
    waterCompressibility = 3.0e-6,
    rockCompressibility = 4.0e-6,
    initialWaterSaturation = 0.25,
    dataPoints,
  } = input;

  if (dataPoints.length < 2) {
    throw new Error('At least two pressure-production points required for Material Balance regression.');
  }

  const diagnosticSeries: HavlenaOdehDiagnosticPoint[] = [];

  for (const pt of dataPoints) {
    const deltaP = initialPressure - pt.pressure;
    const bw = pt.bw ?? 1.02;
    const wp = pt.cumulativeWater ?? 0;
    const gp = (pt.cumulativeGas ?? 0) * 1000; // convert Mscf to scf

    // Underground fluid withdrawal: F = Np*(Bo + (Rp - Rs)*Bg) + Wp*Bw
    // Note: Rp = Gp / Np
    const rp = pt.cumulativeOil > 0 ? gp / pt.cumulativeOil : initialRs;
    const F = pt.cumulativeOil * (pt.bo + (rp - pt.rs) * pt.bg) + wp * bw;

    // Oil expansion: Eo = (Bo - Boi) + (Rsi - Rs) * Bg
    const Eo = (pt.bo - initialBo) + (initialRs - pt.rs) * pt.bg;

    // Gas cap expansion: Eg = Boi * (Bg / Bgi - 1)
    const Eg = initialBg > 0 ? initialBo * (pt.bg / initialBg - 1) : 0;

    // Formation and connate water expansion: Efw = (1 + m) * Boi * ((cw*Swi + cf)/(1 - Swi)) * deltaP
    const efwNumerator = waterCompressibility * initialWaterSaturation + rockCompressibility;
    const efwDenominator = 1 - initialWaterSaturation;
    const Efw = (1 + gasCapRatio) * initialBo * (efwNumerator / efwDenominator) * deltaP;

    // Total Expansion: Et = Eo + m*Eg + Efw
    const Et = Eo + gasCapRatio * Eg + Efw;
    const apparentN = Et > 1e-8 ? F / Et : 0;

    diagnosticSeries.push({
      pressure: pt.pressure,
      undergroundWithdrawalF: Math.round(F),
      oilExpansionEo: Number(Eo.toFixed(5)),
      gasExpansionEg: Number(Eg.toFixed(5)),
      rockWaterExpansionEfw: Number(Efw.toFixed(5)),
      totalExpansionE: Number(Et.toFixed(5)),
      apparentN: Math.round(apparentN),
    });
  }

  // Linear regression: F = N * Et  (y = slope * x, intercept forced through origin)
  let sumXY = 0;
  let sumXX = 0;
  let sumY = 0;
  let sumYY = 0;
  const n = diagnosticSeries.length;

  for (const pt of diagnosticSeries) {
    const x = pt.totalExpansionE;
    const y = pt.undergroundWithdrawalF;
    sumXY += x * y;
    sumXX += x * x;
    sumY += y;
    sumYY += y * y;
  }

  const slope = sumXX > 0 ? sumXY / sumXX : 0;
  const estimatedOOIP = Math.max(0, Math.round(slope));

  // Compute R^2
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const pt of diagnosticSeries) {
    const y = pt.undergroundWithdrawalF;
    const yPred = slope * pt.totalExpansionE;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - yPred, 2);
  }
  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  let drive = 'Solution Gas Drive / Fluid Expansion';
  if (gasCapRatio > 0.3) drive = 'Gas Cap Drive Dominant';
  else if (rSquared < 0.75) drive = 'Possible Active Water Drive / Influx Not Accounted';

  return {
    estimatedOOIP,
    rSquared: Number(rSquared.toFixed(4)),
    diagnosticSeries,
    inferredDriveMechanism: drive,
  };
}
