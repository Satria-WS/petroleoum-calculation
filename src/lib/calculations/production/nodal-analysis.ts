/**
 * Nodal Analysis Pure Calculation Engine.
 * Formulates IPR (Darcy, Vogel, Composite) and VLP curves with Bisection Solver.
 */

export interface InflowParameters {
  reservoirPressure: number;      // Pr in psi
  bubblePointPressure: number;    // Pb in psi
  productivityIndex: number;      // PI in STB/d/psi
}

export interface OutflowParameters {
  wellheadPressure: number;       // Pwh in psi
  tubingInnerDiameter: number;    // ID in inches (e.g. 2.441, 2.992, 3.5)
  depthTVD: number;               // TVD in ft
  depthMD?: number;               // MD in ft (default = TVD)
  oilGravityAPI?: number;         // API gravity (default 35)
  waterCut?: number;              // fraction 0 to 1 (default 0.1)
  gasLiquidRatio?: number;        // GLR in scf/STB (default 500)
}

export interface NodalCurvePoint {
  flowRate: number;               // STB/d
  pwfIpr: number;                 // psi
  pwfVlp: number;                 // psi
}

export interface NodalAnalysisResult {
  aofp: number;                   // Absolute Open Flow Potential (STB/d at Pwf = 0)
  operatingPoint: {
    flowRate: number;             // Q_op in STB/d
    bottomholePressure: number;   // Pwf_op in psi
  } | null;
  curves: NodalCurvePoint[];
}

/**
 * Calculates bottomhole flowing pressure Pwf from flowrate q using Composite Vogel
 */
export function calculateIprPwf(q: number, params: InflowParameters): number {
  const { reservoirPressure: Pr, bubblePointPressure: Pb, productivityIndex: PI } = params;
  if (q <= 0) return Pr;

  // Case 1: Undersaturated throughout (Pr >= Pb and Pwf >= Pb)
  const qAtPb = Pr > Pb ? PI * (Pr - Pb) : 0;

  if (Pr >= Pb && q <= qAtPb) {
    return Math.max(0, Pr - q / PI);
  }

  // Case 2: Pure saturated reservoir (Pr <= Pb)
  if (Pr <= Pb) {
    const qmax = (PI * Pr) / 1.8;
    if (q >= qmax) return 0;
    // Solve Vogel quadratic: 0.8*(Pwf/Pr)^2 + 0.2*(Pwf/Pr) - (1 - q/qmax) = 0
    // Quadratic formula: x = (-b + sqrt(b^2 - 4ac)) / (2a)
    const c = -(1.0 - q / qmax);
    const discriminant = 0.04 - 4.0 * 0.8 * c;
    if (discriminant < 0) return 0;
    const ratio = (-0.2 + Math.sqrt(discriminant)) / 1.6;
    return Math.max(0, ratio * Pr);
  }

  // Case 3: Composite Vogel (Pr > Pb and Pwf < Pb)
  const qVogel = q - qAtPb;
  const qmaxVogel = (PI * Pb) / 1.8;
  if (qVogel >= qmaxVogel) return 0;

  const c = -(1.0 - qVogel / qmaxVogel);
  const discriminant = 0.04 - 4.0 * 0.8 * c;
  if (discriminant < 0) return 0;
  const ratio = (-0.2 + Math.sqrt(discriminant)) / 1.6;
  return Math.max(0, ratio * Pb);
}

/**
 * Calculates Absolute Open Flow Potential (AOFP: max flow rate when Pwf = 0)
 */
export function calculateAofp(params: InflowParameters): number {
  const { reservoirPressure: Pr, bubblePointPressure: Pb, productivityIndex: PI } = params;
  if (Pr <= Pb) {
    return Math.round((PI * Pr) / 1.8);
  }
  const qb = PI * (Pr - Pb);
  const qmaxVogel = (PI * Pb) / 1.8;
  return Math.round(qb + qmaxVogel);
}

/**
 * Estimates Vertical Lift Performance (VLP) flowing bottomhole pressure Pwf
 * Pwf = Pwh + Hydrostatic Head + Frictional Loss
 */
export function calculateVlpPwf(q: number, params: OutflowParameters): number {
  const {
    wellheadPressure: Pwh,
    tubingInnerDiameter: d,
    depthTVD: tvd,
    depthMD = tvd,
    oilGravityAPI = 35,
    waterCut = 0.1,
    gasLiquidRatio = 500,
  } = params;

  // Specific gravities
  const sgOil = 141.5 / (131.5 + oilGravityAPI);
  const sgWater = 1.05;
  const sgLiquid = (1 - waterCut) * sgOil + waterCut * sgWater;

  // Two-phase density degradation due to dissolved/free gas
  const gasFractionFactor = Math.min(0.7, (gasLiquidRatio / 1000) * 0.15);
  const effectiveSg = Math.max(0.3, sgLiquid * (1 - gasFractionFactor));

  // Hydrostatic pressure drop (psi): 0.433 * SG * TVD
  const deltaPh = 0.433 * effectiveSg * tvd;

  // Tubing friction pressure drop (Fanning correlation approximation)
  // deltaPf = (f * rho * v^2 * MD) / (2 * g * d)
  // In petroleum units: deltaPf ~ 1.15e-5 * f * q^2 * SG / d^5 * MD
  const frictionFactor = 0.02; // turbulent roughness
  const d5 = Math.pow(Math.max(1.0, d), 5);
  const deltaPf = (1.15e-5 * frictionFactor * Math.pow(q, 1.85) * effectiveSg * depthMD) / d5;

  return Pwh + deltaPh + deltaPf;
}

export function runNodalAnalysis(
  inflow: InflowParameters,
  outflow: OutflowParameters,
  numPoints = 40
): NodalAnalysisResult {
  const aofp = calculateAofp(inflow);
  const step = aofp / numPoints;

  const curves: NodalCurvePoint[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const q = i * step;
    const pwfIpr = calculateIprPwf(q, inflow);
    const pwfVlp = calculateVlpPwf(q, outflow);

    curves.push({
      flowRate: Math.round(q),
      pwfIpr: Number(pwfIpr.toFixed(1)),
      pwfVlp: Number(pwfVlp.toFixed(1)),
    });
  }

  // Bisection Root Solver for Operating Point: f(q) = Pwf_IPR(q) - Pwf_VLP(q) = 0
  let lowQ = 0;
  let highQ = aofp;
  let opPoint: { flowRate: number; bottomholePressure: number } | null = null;

  // Check if well can flow naturally (at q = 0, Pwf_IPR(0) = Pr > Pwf_VLP(0))
  const fLow = calculateIprPwf(lowQ, inflow) - calculateVlpPwf(lowQ, outflow);
  const fHigh = calculateIprPwf(highQ, inflow) - calculateVlpPwf(highQ, outflow);

  if (fLow > 0 && fHigh < 0) {
    for (let iter = 0; iter < 50; iter++) {
      const midQ = (lowQ + highQ) / 2;
      const fMid = calculateIprPwf(midQ, inflow) - calculateVlpPwf(midQ, outflow);

      if (Math.abs(fMid) < 0.1 || (highQ - lowQ) < 1.0) {
        opPoint = {
          flowRate: Math.round(midQ),
          bottomholePressure: Math.round(calculateIprPwf(midQ, inflow)),
        };
        break;
      }

      if (fMid > 0) {
        lowQ = midQ;
      } else {
        highQ = midQ;
      }
    }
  }

  return {
    aofp,
    operatingPoint: opPoint,
    curves,
  };
}
