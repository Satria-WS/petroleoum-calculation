/**
 * Pure Volumetric Reserve & Monte Carlo Simulation Engine.
 * SPE PRMS Compliant. Standard Field Units internally.
 */

export interface VolumetricInput {
  area: number;                   // acres
  thickness: number;              // ft (net pay)
  porosity: number;               // fraction (0 < phi < 1)
  waterSaturation: number;        // fraction (0 <= Sw <= 1)
  formationVolumeFactor: number;  // Boi in bbl/STB (Oil) or Bgi in ft3/SCF or rcf/scf (Gas)
  recoveryFactor?: number;        // fraction (0 < RF <= 1)
}

export interface VolumetricOutput {
  originalInPlace: number;        // STOIIP in STB (Oil) or GIIP in SCF (Gas)
  recoverableReserves: number;    // STB or SCF
}

/**
 * Deterministic Original Oil In Place (OOIP / STOIIP)
 * Formula: N = (7758 * A * h * phi * (1 - Sw)) / Boi
 */
export function calculateDeterministicOOIP(input: VolumetricInput): VolumetricOutput {
  const { area, thickness, porosity, waterSaturation, formationVolumeFactor, recoveryFactor = 0.3 } = input;
  if (formationVolumeFactor <= 0) throw new Error('Formation volume factor Boi must be greater than zero.');
  if (porosity <= 0 || porosity >= 1) throw new Error('Porosity must be between 0 and 1.');
  if (waterSaturation < 0 || waterSaturation >= 1) throw new Error('Water saturation must be between 0 and 1.');

  const stoiip = (7758 * area * thickness * porosity * (1 - waterSaturation)) / formationVolumeFactor;
  const recoverableReserves = stoiip * recoveryFactor;

  return {
    originalInPlace: Math.round(stoiip),
    recoverableReserves: Math.round(recoverableReserves),
  };
}

/**
 * Deterministic Original Gas In Place (OGIP / GIIP)
 * Formula: G = (43560 * A * h * phi * (1 - Sw)) / Bgi
 */
export function calculateDeterministicOGIP(input: VolumetricInput): VolumetricOutput {
  const { area, thickness, porosity, waterSaturation, formationVolumeFactor, recoveryFactor = 0.7 } = input;
  if (formationVolumeFactor <= 0) throw new Error('Gas formation volume factor Bgi must be greater than zero.');

  const giip = (43560 * area * thickness * porosity * (1 - waterSaturation)) / formationVolumeFactor;
  const recoverableReserves = giip * recoveryFactor;

  return {
    originalInPlace: Math.round(giip),
    recoverableReserves: Math.round(recoverableReserves),
  };
}

export type DistributionType = 'TRIANGULAR' | 'NORMAL' | 'UNIFORM';

export interface ParamDistribution {
  type: DistributionType;
  min?: number;
  mode?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
}

export interface MonteCarloInput {
  area: ParamDistribution;
  thickness: ParamDistribution;
  porosity: ParamDistribution;
  waterSaturation: ParamDistribution;
  formationVolumeFactor: ParamDistribution;
  recoveryFactor: ParamDistribution;
  fluidType: 'OIL' | 'GAS';
  numTrials?: number;
  seed?: number;
}

export interface HistogramBin {
  binMin: number;
  binMax: number;
  binMid: number;
  count: number;
  frequency: number;
}

export interface CdfPoint {
  value: number;
  probabilityExceeded: number; // 0 to 100%
  cumulativeProbability: number;
}

export interface MonteCarloResult {
  p90: number; // Conservative (90% exceedance)
  p50: number; // Median (50% exceedance)
  p10: number; // Optimistic (10% exceedance)
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  histogram: HistogramBin[];
  cdf: CdfPoint[];
}

// Seedable Pseudo-Random Number Generator (Mulberry32)
function createRng(seed = 123456789) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleDistribution(dist: ParamDistribution, rng: () => number): number {
  if (dist.type === 'UNIFORM') {
    const min = dist.min ?? 0;
    const max = dist.max ?? 1;
    return min + rng() * (max - min);
  }

  if (dist.type === 'TRIANGULAR') {
    const a = dist.min ?? 0;
    const b = dist.max ?? 1;
    const c = dist.mode ?? (a + b) / 2;
    const u = rng();
    const fc = (c - a) / (b - a);
    if (u < fc) {
      return a + Math.sqrt(u * (b - a) * (c - a));
    } else {
      return b - Math.sqrt((1 - u) * (b - a) * (b - c));
    }
  }

  if (dist.type === 'NORMAL') {
    const mean = dist.mean ?? 0;
    const stdDev = dist.stdDev ?? 1;
    // Box-Muller transform
    const u1 = Math.max(1e-9, rng());
    const u2 = rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  return dist.mode ?? dist.mean ?? 0;
}

export function runMonteCarloVolumetric(input: MonteCarloInput): MonteCarloResult {
  const numTrials = input.numTrials ?? 10000;
  const rng = createRng(input.seed ?? 42);
  const constantFactor = input.fluidType === 'OIL' ? 7758 : 43560;

  const outcomes: number[] = new Array(numTrials);

  for (let i = 0; i < numTrials; i++) {
    const a = Math.max(0.1, sampleDistribution(input.area, rng));
    const h = Math.max(0.1, sampleDistribution(input.thickness, rng));
    const phi = Math.min(0.99, Math.max(0.01, sampleDistribution(input.porosity, rng)));
    const sw = Math.min(0.99, Math.max(0.0, sampleDistribution(input.waterSaturation, rng)));
    const b = Math.max(0.001, sampleDistribution(input.formationVolumeFactor, rng));
    const rf = Math.min(1.0, Math.max(0.01, sampleDistribution(input.recoveryFactor, rng)));

    const inplace = (constantFactor * a * h * phi * (1 - sw)) / b;
    outcomes[i] = inplace * rf;
  }

  outcomes.sort((x, y) => x - y);

  // Percentiles for PRMS (P90 = conservative, P10 = optimistic)
  // In sorted ascending order:
  // P90 is the 10th percentile index (90% of outcomes are greater)
  // P10 is the 90th percentile index (10% of outcomes are greater)
  const p90Index = Math.floor(0.1 * numTrials);
  const p50Index = Math.floor(0.5 * numTrials);
  const p10Index = Math.floor(0.9 * numTrials);

  const p90 = outcomes[p90Index];
  const p50 = outcomes[p50Index];
  const p10 = outcomes[p10Index];

  let sum = 0;
  for (let i = 0; i < numTrials; i++) sum += outcomes[i];
  const mean = sum / numTrials;

  let varianceSum = 0;
  for (let i = 0; i < numTrials; i++) {
    varianceSum += Math.pow(outcomes[i] - mean, 2);
  }
  const stdDev = Math.sqrt(varianceSum / numTrials);

  // Generate 25 Histogram Bins
  const minVal = outcomes[0];
  const maxVal = outcomes[numTrials - 1];
  const binCount = 25;
  const binWidth = (maxVal - minVal) / binCount;

  const histogram: HistogramBin[] = [];
  for (let b = 0; b < binCount; b++) {
    const bMin = minVal + b * binWidth;
    const bMax = bMin + binWidth;
    histogram.push({
      binMin: Math.round(bMin),
      binMax: Math.round(bMax),
      binMid: Math.round((bMin + bMax) / 2),
      count: 0,
      frequency: 0,
    });
  }

  for (let i = 0; i < numTrials; i++) {
    const val = outcomes[i];
    let binIdx = Math.floor((val - minVal) / binWidth);
    if (binIdx >= binCount) binIdx = binCount - 1;
    if (binIdx < 0) binIdx = 0;
    histogram[binIdx].count++;
  }

  for (const bin of histogram) {
    bin.frequency = Number(((bin.count / numTrials) * 100).toFixed(2));
  }

  // Generate CDF Points
  const cdfPoints = 50;
  const cdf: CdfPoint[] = [];
  for (let p = 0; p <= cdfPoints; p++) {
    const idx = Math.min(numTrials - 1, Math.floor((p / cdfPoints) * (numTrials - 1)));
    const val = outcomes[idx];
    const cumProb = (idx / (numTrials - 1)) * 100;
    const exceedanceProb = 100 - cumProb;
    cdf.push({
      value: Math.round(val),
      cumulativeProbability: Number(cumProb.toFixed(1)),
      probabilityExceeded: Number(exceedanceProb.toFixed(1)),
    });
  }

  return {
    p90: Math.round(p90),
    p50: Math.round(p50),
    p10: Math.round(p10),
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    min: Math.round(minVal),
    max: Math.round(maxVal),
    histogram,
    cdf,
  };
}
