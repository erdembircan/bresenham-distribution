import { describe, it, expect } from 'vitest';
import {
  bresenham,
  moduloSpread,
  euclideanRhythm,
  rotate,
  cyclicGaps,
  extraPositions,
  KNOWN_RHYTHMS,
} from './distribute';

const PAIRS: Array<[number, number]> = [
  [100, 7], [13, 5], [12, 8], [9, 4], [16, 9],
  [200, 30], [1, 7], [7, 7], [33, 1], [0, 5],
];

describe('bresenham()', () => {
  it.each(PAIRS)('sums to N for (n=%i, k=%i)', (n, k) => {
    const sum = bresenham(n, k).reduce((a, b) => a + b, 0);
    expect(sum).toBe(n);
  });

  it.each(PAIRS)('max − min ≤ 1 for (n=%i, k=%i)', (n, k) => {
    const d = bresenham(n, k);
    expect(Math.max(...d) - Math.min(...d)).toBeLessThanOrEqual(1);
  });

  it('returns the canonical [14,14,14,15,14,14,15] for (100, 7)', () => {
    expect(bresenham(100, 7)).toEqual([14, 14, 14, 15, 14, 14, 15]);
  });
});

describe('moduloSpread()', () => {
  it.each(PAIRS)('sums to N for (n=%i, k=%i)', (n, k) => {
    const sum = moduloSpread(n, k).reduce((a, b) => a + b, 0);
    expect(sum).toBe(n);
  });

  it('front-loads extras at positions 0..r−1', () => {
    expect(moduloSpread(100, 7)).toEqual([15, 15, 14, 14, 14, 14, 14]);
  });
});

describe('euclideanRhythm()', () => {
  it('E(3, 8) rotated by tresillo downbeat = canonical tresillo', () => {
    const preset = KNOWN_RHYTHMS['3,8'];
    expect(rotate(euclideanRhythm(3, 8), preset.downbeat)).toEqual([1, 0, 0, 1, 0, 0, 1, 0]);
  });

  it('E(5, 8) rotated by cinquillo downbeat = canonical cinquillo', () => {
    const preset = KNOWN_RHYTHMS['5,8'];
    expect(rotate(euclideanRhythm(5, 8), preset.downbeat)).toEqual([1, 0, 1, 1, 0, 1, 1, 0]);
  });

  it('beat count equals K', () => {
    for (const [k, n] of [[3, 8], [5, 12], [7, 16]]) {
      const onsets = euclideanRhythm(k, n).reduce((a, b) => a + b, 0);
      expect(onsets).toBe(k);
    }
  });
});

describe('cyclicGaps()', () => {
  it('Bresenham minimizes gap spread vs modulo for (10, 3)', () => {
    const ePosBres = extraPositions(bresenham(10, 3));
    const ePosMod = extraPositions(moduloSpread(10, 3));
    const bresSpread = cyclicGaps(ePosBres, 3).spread;
    const modSpread = cyclicGaps(ePosMod, 3).spread;
    expect(bresSpread).toBeLessThanOrEqual(modSpread);
  });
});
