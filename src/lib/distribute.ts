/**
 * Bresenham's line algorithm, recast as a fair-distribution algorithm.
 *
 *   bucket[i] = floor(N(i+1)/K) - floor(N·i/K)
 *
 * Spreads the (N mod K) "extras" maximally far apart in a cycle of K,
 * unlike modulo-spread which front-loads them.
 */
export function bresenham(n: number, k: number): number[] {
  const out: number[] = new Array(k);
  for (let i = 0; i < k; i++) {
    out[i] = Math.floor((n * (i + 1)) / k) - Math.floor((n * i) / k);
  }
  return out;
}

/**
 * The "obvious" approach: first R buckets get base + 1, the rest get base.
 * Sums to N but front-loads the extras into a contiguous block.
 */
export function moduloSpread(n: number, k: number): number[] {
  const base = Math.floor(n / k);
  const r = n % k;
  const out: number[] = new Array(k);
  for (let i = 0; i < k; i++) out[i] = base + (i < r ? 1 : 0);
  return out;
}

/**
 * Euclidean rhythm: K beats placed across N steps as evenly as possible.
 * Built directly on Bresenham — a "1" wherever the line crosses a new row.
 *
 * E(3, 8) = [1, 0, 0, 1, 0, 0, 1, 0]  — Cuban tresillo
 */
export function euclideanRhythm(beats: number, steps: number): number[] {
  const pattern: number[] = new Array(steps);
  for (let i = 0; i < steps; i++) {
    const lo = Math.floor((beats * i) / steps);
    const hi = Math.floor((beats * (i + 1)) / steps);
    pattern[i] = hi > lo ? 1 : 0;
  }
  return pattern;
}

/**
 * Cyclically rotate a pattern by `offset` steps.
 * Music convention starts each rhythm on its "downbeat," which differs
 * per rhythm — there's no math rule that picks it.
 */
export function rotate<T>(pattern: readonly T[], offset: number): T[] {
  const n = pattern.length;
  if (n === 0) return [];
  const k = ((offset % n) + n) % n;
  return [...pattern.slice(k), ...pattern.slice(0, k)];
}

/** Indices in `dist` where the bucket value exceeds the floor. */
export function extraPositions(dist: readonly number[]): number[] {
  if (dist.length === 0) return [];
  const min = Math.min(...dist);
  const out: number[] = [];
  for (let i = 0; i < dist.length; i++) if (dist[i] > min) out.push(i);
  return out;
}

/**
 * Cyclic gap stats between consecutive "extra" positions in a length-K cycle.
 * Bresenham minimizes (max − min). Modulo spread maximizes it.
 */
export function cyclicGaps(positions: readonly number[], k: number) {
  if (positions.length === 0) {
    return { gaps: [] as number[], min: 0, max: 0, spread: 0 };
  }
  const gaps: number[] = [];
  for (let i = 0; i < positions.length; i++) {
    const next = (i + 1) % positions.length;
    const raw =
      next > i ? positions[next] - positions[i] : k - positions[i] + positions[next];
    gaps.push(raw);
  }
  const min = Math.min(...gaps);
  const max = Math.max(...gaps);
  return { gaps, min, max, spread: max - min };
}

/**
 * Friendly preset names for known Euclidean rhythms (beats, steps).
 * `downbeat` is the offset to rotate Bresenham's raw output so the canonical
 * downbeat lands at index 0 (a music-convention choice, not a math rule).
 */
export type Preset = { name: string; origin: string; downbeat: number };
export const KNOWN_RHYTHMS: Record<string, Preset> = {
  '3,8':  { name: 'Cuban tresillo',       origin: 'Backbone of salsa, reggaeton, half of modern pop',    downbeat: 7 },
  '5,8':  { name: 'Cuban cinquillo',      origin: 'Foundation of son and contradanza',                  downbeat: 1 },
  '4,9':  { name: 'Turkish aksak',        origin: 'Asymmetric meter across the Balkans and Turkey',     downbeat: 0 },
  '5,12': { name: 'Ghanaian bell',        origin: 'Traditional West African bell pattern',              downbeat: 0 },
  '7,12': { name: 'West African bell',    origin: 'Common across sub-Saharan drumming traditions',      downbeat: 0 },
  '3,7':  { name: 'Bulgarian ruchenitza', origin: 'A 7/8 folk dance rhythm from Bulgaria',              downbeat: 0 },
  '4,16': { name: 'Four on the floor',    origin: 'Disco, house, techno — the universal pulse',         downbeat: 0 },
  '9,16': { name: 'Afro-Cuban',           origin: 'Complex polyrhythmic Afro-Cuban pattern',            downbeat: 0 },
  '5,16': { name: 'Bossa nova',           origin: 'Brazilian bossa nova bass pattern',                  downbeat: 0 },
};
