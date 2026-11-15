import { Units } from '../types';

const LB_PER_KG = 2.20462;

/** Converts a stored lb value to the display unit, rounded to 0.1. */
export function fromLbs(lbs: number, units: Units): number {
  const value = units === 'kg' ? lbs / LB_PER_KG : lbs;
  return Math.round(value * 10) / 10;
}

/** Converts a value entered in the display unit back to lb for storage. */
export function toLbs(value: number, units: Units): number {
  return units === 'kg' ? value * LB_PER_KG : value;
}

export function formatWeight(lbs: number, units: Units): string {
  return `${fromLbs(lbs, units)} ${units}`;
}
