/**
 * Artificial Lift Design & Sizing Engine.
 * Supports Electric Submersible Pump (ESP) and Continuous Gas Lift sizing.
 */

export interface EspSizingInput {
  targetFlowRate: number;         // Q in STB/d
  pumpSettingDepthTVD: number;    // ft
  pumpSettingDepthMD?: number;    // ft (default = TVD)
  tubingInnerDiameter: number;    // inches (e.g. 2.875)
  wellheadPressure: number;       // Pwh in psi
  pumpIntakePressure: number;     // PIP in psi (from IPR at target Q)
  fluidSpecificGravity?: number;  // SG (default 0.9)
  headPerStage?: number;          // ft/stage from pump catalog (default 45 ft/stage)
  pumpEfficiency?: number;        // fraction (default 0.65)
}

export interface EspSizingResult {
  totalDynamicHeadFt: number;     // TDH in ft
  numberOfStages: number;
  brakeHorsepower: number;        // Motor HP
  operatingFrequencyHz: number;   // 60 Hz standard
  dischargePressurePsi: number;
}

export function calculateEspSizing(input: EspSizingInput): EspSizingResult {
  const {
    targetFlowRate: Q,
    pumpSettingDepthTVD: tvd,
    pumpSettingDepthMD = tvd,
    tubingInnerDiameter: d,
    wellheadPressure: Pwh,
    pumpIntakePressure: pip,
    fluidSpecificGravity: sg = 0.9,
    headPerStage = 45,
    pumpEfficiency = 0.65,
  } = input;

  // 1. Net Lift Head (ft): depth of pump minus fluid level head from intake pressure
  // Intake head = PIP / (0.433 * SG)
  const intakeHead = pip / (0.433 * sg);
  const netLiftHead = Math.max(0, tvd - intakeHead);

  // 2. Tubing Friction Head Loss (ft) via Hazen-Williams or Darcy
  // Friction head: Hf ~ 2.083 * (100/C)^1.85 * (Q_gpm^1.85 / d^4.8655) * (MD/100)
  // Convert STB/d to GPM: 1 STB/d = 0.02917 GPM
  const qGpm = Q * 0.02917;
  const cFactor = 120; // Steel tubing factor
  const frictionHeadPer100Ft = 0.2083 * Math.pow(100 / cFactor, 1.85) * (Math.pow(qGpm, 1.85) / Math.pow(d, 4.8655));
  const totalFrictionHead = (frictionHeadPer100Ft * pumpSettingDepthMD) / 100;

  // 3. Wellhead Pressure Head (ft)
  const wellheadHead = Pwh / (0.433 * sg);

  // Total Dynamic Head (TDH)
  const tdh = netLiftHead + totalFrictionHead + wellheadHead;

  // Stages count
  const numberOfStages = Math.ceil(tdh / headPerStage);

  // Motor Brake Horsepower (BHP): (Q_gpm * TDH * SG) / (3960 * efficiency)
  const bhp = (qGpm * tdh * sg) / (3960 * pumpEfficiency);

  // Pump Discharge Pressure (psi)
  const dischargePressure = pip + tdh * 0.433 * sg;

  return {
    totalDynamicHeadFt: Math.round(tdh),
    numberOfStages,
    brakeHorsepower: Number(bhp.toFixed(1)),
    operatingFrequencyHz: 60,
    dischargePressurePsi: Math.round(dischargePressure),
  };
}

export interface GasLiftInput {
  oilRate: number;                // STB/d
  formationGor: number;           // scf/STB
  targetGlr: number;              // scf/STB (optimum GLR from lift performance curve)
  wellheadPressure: number;       // psi
  availableGasPressure: number;   // Surface injection gas pressure (psi)
  depthTVD: number;               // ft
  kickoffMargin?: number;         // psi (default 100)
}

export interface GasLiftResult {
  injectionDepthTVD: number;      // ft
  requiredGasRateMscfd: number;   // Mscf/d
  operatingInjectionPressure: number; // psi
}

export function calculateGasLift(input: GasLiftInput): GasLiftResult {
  const {
    oilRate,
    formationGor,
    targetGlr,
    availableGasPressure,
    depthTVD,
    kickoffMargin = 100,
  } = input;

  // Operating gas injection pressure with safety kickoff margin
  const pOperating = Math.max(100, availableGasPressure - kickoffMargin);

  // Maximum injection depth from gas gradient (~ 0.025 psi/ft)
  // Injection depth ~ P_operating / (gas gradient - liquid gradient differential)
  const gasGradient = 0.025; // psi/ft
  const liquidGradient = 0.40; // psi/ft
  const injectionDepth = Math.min(
    depthTVD,
    Math.round(pOperating / (liquidGradient - gasGradient))
  );

  // Additional gas needed to reach target GLR:
  // Q_inj = OilRate * (Target_GLR - Formation_GOR) / 1000 in Mscf/d
  const deltaGlr = Math.max(0, targetGlr - formationGor);
  const requiredGasRateMscfd = Math.round((oilRate * deltaGlr) / 1000);

  return {
    injectionDepthTVD: Math.max(1000, injectionDepth),
    requiredGasRateMscfd,
    operatingInjectionPressure: pOperating,
  };
}
