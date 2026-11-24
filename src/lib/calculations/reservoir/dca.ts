/**
 * Arps Decline Curve Analysis (DCA) Pure Calculation Engine.
 * Supports Exponential, Hyperbolic, and Harmonic decline models.
 * Includes numerical boundary safeguards (b = 0 division-by-zero guard).
 */

export type DeclineModel = 'EXPONENTIAL' | 'HYPERBOLIC' | 'HARMONIC';

export interface DcaInput {
  initialRate: number;            // qi in STB/d (or Mscf/d)
  initialDeclineNominal: number;  // Di nominal decline per year (fraction, e.g. 0.25 for 25%/yr)
  bFactor: number;                // b exponent (0 <= b <= 1, or > 1 for unconventional)
  economicLimitRate: number;      // q_el in STB/d (or Mscf/d)
  forecastYears?: number;         // duration to project (years, default 10)
}

export interface DcaForecastPoint {
  timeMonths: number;
  timeYears: number;
  rate: number;                   // q(t)
  cumulativeProduction: number;   // Np(t) in STB or Mscf
}

export interface DcaResult {
  declineModelUsed: DeclineModel;
  timeToEconomicLimitMonths: number;
  timeToEconomicLimitYears: number;
  estimatedUltimateRecovery: number; // EUR at economic limit
  forecastSeries: DcaForecastPoint[];
}

/**
 * Evaluates flow rate at time t (in years) based on Arps equations
 */
export function calculateArpsRate(qi: number, Di: number, b: number, tYears: number): number {
  if (tYears <= 0) return qi;

  // Rule 7 Guard: When b === 0 or |b| < 1e-6, use Exponential equation
  if (Math.abs(b) < 1e-6) {
    return qi * Math.exp(-Di * tYears);
  }

  // Harmonic equation (b === 1)
  if (Math.abs(b - 1.0) < 1e-6) {
    return qi / (1.0 + Di * tYears);
  }

  // Hyperbolic equation (0 < b < 1 or b > 1)
  return qi / Math.pow(1.0 + b * Di * tYears, 1.0 / b);
}

/**
 * Evaluates cumulative production Np at time t (in years)
 * Note: Conversion factor 365.25 days/year converts rate from STB/day to STB/year
 */
export function calculateArpsCumulative(qi: number, Di: number, b: number, tYears: number): number {
  if (tYears <= 0 || Di <= 0) return 0;
  const daysPerYear = 365.25;
  const qiAnnual = qi * daysPerYear;

  // Exponential cumulative: Np = (qi - q(t)) / Di
  if (Math.abs(b) < 1e-6) {
    const qt = calculateArpsRate(qi, Di, b, tYears);
    return (qiAnnual - qt * daysPerYear) / Di;
  }

  // Harmonic cumulative: Np = (qi / Di) * ln(qi / q(t))
  if (Math.abs(b - 1.0) < 1e-6) {
    const qt = calculateArpsRate(qi, Di, b, tYears);
    if (qt <= 0) return 0;
    return (qiAnnual / Di) * Math.log(qi / qt);
  }

  // Hyperbolic cumulative: Np = (qi^b / ((1 - b) * Di)) * (qi^(1 - b) - q(t)^(1 - b))
  const qt = calculateArpsRate(qi, Di, b, tYears);
  const factor = Math.pow(qiAnnual, b) / ((1.0 - b) * Di);
  const term = Math.pow(qiAnnual, 1.0 - b) - Math.pow(qt * daysPerYear, 1.0 - b);
  return factor * term;
}

/**
 * Calculates time (in years) required to decline from qi to economic limit rate q_el
 */
export function calculateTimeToLimit(qi: number, Di: number, b: number, qel: number): number {
  if (qi <= qel || Di <= 0) return 0;

  // Exponential
  if (Math.abs(b) < 1e-6) {
    return Math.log(qi / qel) / Di;
  }

  // Harmonic
  if (Math.abs(b - 1.0) < 1e-6) {
    return (qi / qel - 1.0) / Di;
  }

  // Hyperbolic
  return (Math.pow(qi / qel, b) - 1.0) / (b * Di);
}

export function runDcaAnalysis(input: DcaInput): DcaResult {
  const { initialRate, initialDeclineNominal, bFactor, economicLimitRate, forecastYears = 10 } = input;
  if (initialRate <= 0) throw new Error('Initial flow rate must be positive.');
  if (initialDeclineNominal <= 0) throw new Error('Decline rate must be positive.');
  if (economicLimitRate <= 0) throw new Error('Economic limit must be positive.');

  let model: DeclineModel = 'HYPERBOLIC';
  if (Math.abs(bFactor) < 1e-6) model = 'EXPONENTIAL';
  else if (Math.abs(bFactor - 1.0) < 1e-6) model = 'HARMONIC';

  const tLimitYears = calculateTimeToLimit(initialRate, initialDeclineNominal, bFactor, economicLimitRate);
  const eur = calculateArpsCumulative(initialRate, initialDeclineNominal, bFactor, tLimitYears);

  // Generate monthly forecast series
  const totalMonths = forecastYears * 12;
  const forecastSeries: DcaForecastPoint[] = [];

  for (let m = 0; m <= totalMonths; m += 2) {
    const tY = m / 12.0;
    const q = calculateArpsRate(initialRate, initialDeclineNominal, bFactor, tY);
    const np = calculateArpsCumulative(initialRate, initialDeclineNominal, bFactor, tY);

    forecastSeries.push({
      timeMonths: m,
      timeYears: Number(tY.toFixed(2)),
      rate: Math.max(0, Math.round(q)),
      cumulativeProduction: Math.round(np),
    });
  }

  return {
    declineModelUsed: model,
    timeToEconomicLimitMonths: Number((tLimitYears * 12).toFixed(1)),
    timeToEconomicLimitYears: Number(tLimitYears.toFixed(2)),
    estimatedUltimateRecovery: Math.round(eur),
    forecastSeries,
  };
}
