/**
 * Pure Unit Conversion Engine for Petroleum Engineering.
 * Zero UI, Zero Database dependencies.
 * Internally all calculation engines operate in standard Field Units:
 * Pressure: psi
 * Depth/Length: ft
 * Oil Volume: bbl
 * Gas Volume: scf (or Mscf)
 * Liquid Rate: STB/d
 * Gas Rate: Mscf/d
 * Density: ppg
 * Temperature: °F
 */

export const UnitFactors = {
  // Pressure
  PSI_TO_BAR: 0.0689476,
  BAR_TO_PSI: 14.5038,
  PSI_TO_KPA: 6.89476,
  KPA_TO_PSI: 0.145038,

  // Length
  FT_TO_M: 0.3048,
  M_TO_FT: 3.28084,

  // Volume
  BBL_TO_M3: 0.158987,
  M3_TO_BBL: 6.28981,
  CUFT_TO_M3: 0.0283168,
  M3_TO_CUFT: 35.3147,

  // Density
  PPG_TO_SG: 0.119826,
  SG_TO_PPG: 8.3454,
  PPG_TO_KG_M3: 119.826,
  KG_M3_TO_PPG: 0.0083454,

  // Viscosity
  CP_TO_PA_S: 0.001,
  PA_S_TO_CP: 1000,
};

// Pressure Converters
export function psiToBar(psi: number): number {
  return psi * UnitFactors.PSI_TO_BAR;
}
export function barToPsi(bar: number): number {
  return bar * UnitFactors.BAR_TO_PSI;
}
export function psiToKpa(psi: number): number {
  return psi * UnitFactors.PSI_TO_KPA;
}
export function kpaToPsi(kpa: number): number {
  return kpa * UnitFactors.KPA_TO_PSI;
}

// Length Converters
export function ftToM(ft: number): number {
  return ft * UnitFactors.FT_TO_M;
}
export function mToFt(m: number): number {
  return m * UnitFactors.M_TO_FT;
}

// Volume Converters
export function bblToM3(bbl: number): number {
  return bbl * UnitFactors.BBL_TO_M3;
}
export function m3ToBbl(m3: number): number {
  return m3 * UnitFactors.M3_TO_BBL;
}

// Flowrate Converters
export function stbDayToM3Day(stb: number): number {
  return stb * UnitFactors.BBL_TO_M3;
}
export function m3DayToStbDay(m3d: number): number {
  return m3d * UnitFactors.M3_TO_BBL;
}
export function mscfDayToSm3Day(mscf: number): number {
  return mscf * 1000 * UnitFactors.CUFT_TO_M3;
}
export function sm3DayToMscfDay(sm3d: number): number {
  return (sm3d * UnitFactors.M3_TO_CUFT) / 1000;
}

// Density Converters
export function ppgToSg(ppg: number): number {
  return ppg * UnitFactors.PPG_TO_SG;
}
export function sgToPpg(sg: number): number {
  return sg * UnitFactors.SG_TO_PPG;
}

// Temperature Converters
export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

// Generic Conversion Helper
export type ConversionType =
  | 'PRESSURE'
  | 'LENGTH'
  | 'VOLUME'
  | 'FLOW_RATE_LIQUID'
  | 'FLOW_RATE_GAS'
  | 'DENSITY'
  | 'TEMPERATURE';

export function convertValue(
  value: number,
  type: ConversionType,
  fromSystem: 'FIELD' | 'SI',
  toSystem: 'FIELD' | 'SI'
): number {
  if (fromSystem === toSystem) return value;

  if (fromSystem === 'FIELD' && toSystem === 'SI') {
    switch (type) {
      case 'PRESSURE':
        return psiToBar(value);
      case 'LENGTH':
        return ftToM(value);
      case 'VOLUME':
        return bblToM3(value);
      case 'FLOW_RATE_LIQUID':
        return stbDayToM3Day(value);
      case 'FLOW_RATE_GAS':
        return mscfDayToSm3Day(value);
      case 'DENSITY':
        return ppgToSg(value);
      case 'TEMPERATURE':
        return fahrenheitToCelsius(value);
    }
  } else {
    // SI to FIELD
    switch (type) {
      case 'PRESSURE':
        return barToPsi(value);
      case 'LENGTH':
        return mToFt(value);
      case 'VOLUME':
        return m3ToBbl(value);
      case 'FLOW_RATE_LIQUID':
        return m3DayToStbDay(value);
      case 'FLOW_RATE_GAS':
        return sm3DayToMscfDay(value);
      case 'DENSITY':
        return sgToPpg(value);
      case 'TEMPERATURE':
        return celsiusToFahrenheit(value);
    }
  }
}
