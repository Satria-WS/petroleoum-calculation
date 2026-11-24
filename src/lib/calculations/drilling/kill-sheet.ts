/**
 * Well Control Kill Sheet — Wait & Weight Method (Engineer's Method).
 * Calculates KMW, ICP, FCP, Drillstring & Annular volumes, and Step-Down Schedule.
 */

export interface KillSheetInput {
  trueVerticalDepth: number;          // TVD in ft
  measuredDepth: number;               // MD in ft
  currentMudWeight: number;            // OMW in ppg
  sidpp: number;                       // Shut-in Drill Pipe Pressure in psi
  sicp: number;                        // Shut-in Casing Pressure in psi
  slowCirculatingPressure: number;     // SCR / Kill rate pressure in psi
  slowCirculatingRateSpm?: number;     // SPM (e.g. 30 SPM)
  drillpipeCapacity: number;           // bbl/ft (e.g. 0.01776 for 5" DP)
  drillpipeLength?: number;            // ft (default = MD - 600 ft collar)
  drillcollarCapacity?: number;        // bbl/ft (e.g. 0.0087 for 6-1/2" DC)
  drillcollarLength?: number;          // ft (default 600 ft)
  pumpOutputBblPerStroke: number;      // bbl/stroke (e.g. 0.119 bbl/stk)
}

export interface StepDownSchedulePoint {
  step: number;
  strokes: number;
  drillpipePressure: number;          // psi (drops linearly from ICP to FCP)
  volumePumpedBbl: number;
}

export interface KillSheetResult {
  killMudWeightPpg: number;           // KMW
  initialCirculatingPressurePsi: number; // ICP
  finalCirculatingPressurePsi: number;   // FCP
  drillpipeVolumeBbl: number;
  drillcollarVolumeBbl: number;
  totalDrillstringVolumeBbl: number;
  strokesToBit: number;               // STB
  timeToBitMinutes: number;
  stepDownSchedule: StepDownSchedulePoint[];
}

export function calculateKillSheet(input: KillSheetInput): KillSheetResult {
  const {
    trueVerticalDepth: tvd,
    measuredDepth: md,
    currentMudWeight: omw,
    sidpp,
    sicp,
    slowCirculatingPressure: scr,
    slowCirculatingRateSpm = 30,
    drillpipeCapacity: dpCap,
    drillcollarCapacity: dcCap = 0.0087,
    drillcollarLength: dcLen = 600,
    pumpOutputBblPerStroke: pumpOutput,
  } = input;

  if (tvd <= 0 || omw <= 0 || pumpOutput <= 0) {
    throw new Error('TVD, mud weight, and pump output must be positive non-zero values.');
  }

  // 1. Kill Mud Weight: KMW = OMW + SIDPP / (0.052 * TVD)
  const kmw = omw + sidpp / (0.052 * tvd);

  // 2. Initial Circulating Pressure: ICP = SIDPP + SCR
  const icp = sidpp + scr;

  // 3. Final Circulating Pressure: FCP = SCR * (KMW / OMW)
  const fcp = scr * (kmw / omw);

  // 4. Drillstring Volume & Strokes to Bit
  const dpLen = input.drillpipeLength ?? Math.max(0, md - dcLen);
  const dpVol = dpLen * dpCap;
  const dcVol = dcLen * dcCap;
  const totalDsVol = dpVol + dcVol;
  const strokesToBit = Math.ceil(totalDsVol / pumpOutput);
  const timeToBitMin = strokesToBit / slowCirculatingRateSpm;

  // 5. Step-Down Drillpipe Pressure Schedule (10 intervals from 0 to STB)
  const scheduleSteps = 10;
  const strokeIncrement = Math.round(strokesToBit / scheduleSteps);
  const stepDownSchedule: StepDownSchedulePoint[] = [];

  for (let s = 0; s <= scheduleSteps; s++) {
    const strokes = Math.min(strokesToBit, s * strokeIncrement);
    const fraction = strokes / strokesToBit;
    // Linear pressure decrease from ICP to FCP
    const dpPressure = icp - fraction * (icp - fcp);

    stepDownSchedule.push({
      step: s,
      strokes,
      drillpipePressure: Math.round(dpPressure),
      volumePumpedBbl: Number((strokes * pumpOutput).toFixed(1)),
    });
  }

  return {
    killMudWeightPpg: Number(kmw.toFixed(2)),
    initialCirculatingPressurePsi: Math.round(icp),
    finalCirculatingPressurePsi: Math.round(fcp),
    drillpipeVolumeBbl: Number(dpVol.toFixed(1)),
    drillcollarVolumeBbl: Number(dcVol.toFixed(1)),
    totalDrillstringVolumeBbl: Number(totalDsVol.toFixed(1)),
    strokesToBit,
    timeToBitMinutes: Number(timeToBitMin.toFixed(1)),
    stepDownSchedule,
  };
}
