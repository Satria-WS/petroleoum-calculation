import { describe, it, expect } from 'vitest';
import {
  psiToBar,
  barToPsi,
  ftToM,
  mToFt,
  bblToM3,
  m3ToBbl,
  ppgToSg,
  sgToPpg,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  convertValue,
} from '@/lib/units/converter';

describe('Petroleum Unit Converter Engine', () => {
  it('converts pressure accurately (psi <-> bar)', () => {
    // 1000 psi ~ 68.95 bar
    expect(psiToBar(1000)).toBeCloseTo(68.95, 1);
    expect(barToPsi(68.9476)).toBeCloseTo(1000, 0);
  });

  it('converts length accurately (ft <-> m)', () => {
    // 10,000 ft = 3048 m
    expect(ftToM(10000)).toBeCloseTo(3048, 0);
    expect(mToFt(3048)).toBeCloseTo(10000, 0);
  });

  it('converts volume accurately (bbl <-> m3)', () => {
    // 100 bbl = 15.8987 m3
    expect(bblToM3(100)).toBeCloseTo(15.9, 1);
    expect(m3ToBbl(15.8987)).toBeCloseTo(100, 0);
  });

  it('converts density accurately (ppg <-> SG)', () => {
    // Fresh water: 8.345 ppg = 1.0 SG
    expect(ppgToSg(8.3454)).toBeCloseTo(1.0, 2);
    expect(sgToPpg(1.0)).toBeCloseTo(8.35, 1);
  });

  it('converts temperature accurately (°F <-> °C)', () => {
    // 212 °F = 100 °C
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100, 1);
    expect(celsiusToFahrenheit(100)).toBeCloseTo(212, 1);
  });

  it('handles generic convertValue interface', () => {
    expect(convertValue(1000, 'PRESSURE', 'FIELD', 'SI')).toBeCloseTo(68.95, 1);
    expect(convertValue(68.9476, 'PRESSURE', 'SI', 'FIELD')).toBeCloseTo(1000, 0);
    expect(convertValue(500, 'PRESSURE', 'FIELD', 'FIELD')).toBe(500);
  });
});
