import { useMemo, useState } from 'react';
import {
  bresenham,
  moduloSpread,
  cyclicGaps,
  extraPositions,
} from '../lib/distribute';
import { Slider } from './Slider';
import { Tex } from './Tex';

type Method = {
  key: 'mod' | 'bres';
  name: string;
  blurb: string;
  tex: string;
  accent: 'mod' | 'bres';
  dist: number[];
};

function MethodPanel({ method, k }: { method: Method; k: number }) {
  const dist = method.dist;
  const positions = useMemo(() => extraPositions(dist), [dist]);
  const gaps = useMemo(() => cyclicGaps(positions, k), [positions, k]);
  const base = Math.min(...dist);
  const accentVar = method.accent === 'bres' ? 'var(--color-bres)' : 'var(--color-mod)';
  const tintVar = method.accent === 'bres' ? 'var(--color-bres-tint)' : 'var(--color-mod-tint)';

  return (
    <article
      className="grid row-span-5 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-warm)]/30 p-7"
      style={{ gridTemplateRows: 'subgrid', gap: '1.5rem' }}
    >
      {/* Row 1 — header: label + title (left), formula (right) */}
      <header className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-rule-faint)] pb-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accentVar }}
          >
            {method.key === 'bres' ? 'Method B' : 'Method A'}
          </p>
          <h3
            className="mt-1 text-[24px] leading-tight tracking-[-0.01em]"
            style={{ color: accentVar, fontVariationSettings: '"opsz" 60, "SOFT" 50' }}
          >
            {method.name}
          </h3>
        </div>
        <div className="text-right text-[color:var(--color-ink)] text-[14px]">
          <Tex tex={method.tex} />
        </div>
      </header>

      {/* Row 2 — blurb */}
      <p className="text-[14px] leading-[1.55] text-[color:var(--color-ink-soft)]">
        {method.blurb}
      </p>

      {/* Row 3 — cycle */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
          The cycle &middot; extras marked
        </p>
        <div className="mt-3 flex items-center gap-[6px] flex-wrap">
          {dist.map((count, i) => {
            const isExtra = count > base;
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ minWidth: 14 }}
              >
                <span
                  className="block rounded-full transition-colors"
                  style={{
                    width: 12,
                    height: 12,
                    background: isExtra ? accentVar : 'transparent',
                    border: `1.25px solid ${isExtra ? accentVar : 'var(--color-rule)'}`,
                  }}
                  aria-label={isExtra ? 'extra' : 'base'}
                />
                <span
                  className="mt-1 font-mono text-[9px] text-[color:var(--color-ink-mute)]"
                  data-tabular
                >
                  {i}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4 — bars */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
          Bucket heights
        </p>
        <div className="mt-2 flex items-end gap-[3px] h-24 border-b border-[color:var(--color-rule)] pb-px">
          {dist.map((count, i) => {
            const max = Math.max(...dist);
            const h = max > 0 ? (count / max) * 100 : 0;
            const isExtra = count > base;
            return (
              <div
                key={i}
                className="flex-1 transition-all"
                style={{
                  height: `${h}%`,
                  minHeight: 2,
                  background: isExtra ? accentVar : tintVar,
                  border: `1px solid ${isExtra ? accentVar : 'var(--color-rule)'}`,
                  borderBottom: 'none',
                }}
                title={`bucket ${i} = ${count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Row 5 — stats */}
      <dl className="grid grid-cols-3 gap-x-6 gap-y-1 border-t border-[color:var(--color-rule-faint)] pt-4">
        <Stat label="min gap" value={gaps.min} />
        <Stat label="max gap" value={gaps.max} />
        <Stat label="spread" value={gaps.spread} highlight={method.accent} />
      </dl>
    </article>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: 'bres' | 'mod';
}) {
  const color =
    highlight === 'bres'
      ? 'var(--color-bres)'
      : highlight === 'mod'
        ? 'var(--color-mod)'
        : 'var(--color-ink)';
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
        {label}
      </dt>
      <dd
        className="mt-1 font-serif text-[20px] leading-none"
        style={{ color, fontVariationSettings: '"opsz" 60' }}
        data-tabular
      >
        {value}
      </dd>
    </div>
  );
}

export function Comparison() {
  const [n, setN] = useState(100);
  const [k, setK] = useState(7);

  const remainder = n % k;
  const mod = useMemo(() => moduloSpread(n, k), [n, k]);
  const bres = useMemo(() => bresenham(n, k), [n, k]);

  const methodA: Method = {
    key: 'mod',
    name: 'Modulo spread',
    blurb:
      'First R buckets get the base + 1; the rest get base. Sums to N. The extras pile up at the front of the cycle — front-loaded imbalance.',
    tex: `\\text{base} + \\mathbb{1}[i < N \\bmod K]`,
    accent: 'mod',
    dist: mod,
  };
  const methodB: Method = {
    key: 'bres',
    name: 'Bresenham',
    blurb:
      'Same total, same number of extras — but the extras land maximally far apart in the cycle. The same arithmetic that draws a straight line distributes work evenly.',
    tex: `\\left\\lfloor \\tfrac{N(i+1)}{K} \\right\\rfloor - \\left\\lfloor \\tfrac{Ni}{K} \\right\\rfloor`,
    accent: 'bres',
    dist: bres,
  };

  return (
    <div>
      {/* Top control row */}
      <div className="mb-8 flex flex-wrap items-end gap-x-10 gap-y-5 border-b border-[color:var(--color-rule)] pb-6">
        <Slider label="Items" symbol="N" value={n} min={5} max={200} accent="ink" onChange={setN} />
        <Slider label="Buckets" symbol="K" value={k} min={2} max={30} accent="ink" onChange={(v) => setK(Math.min(v, n))} />
        <div className="ml-auto text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
            Remainder
          </p>
          <p className="mt-1 text-[15px]">
            <Tex tex={`${n} \\bmod ${k} = ${remainder}`} /> &nbsp;
            <span className="text-[color:var(--color-ink-mute)]">
              ({remainder === 1 ? '1 extra' : `${remainder} extras`})
            </span>
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-x-6"
        style={{ gridTemplateRows: 'auto auto auto auto auto', rowGap: '1.5rem' }}
      >
        <MethodPanel method={methodA} k={k} />
        <MethodPanel method={methodB} k={k} />
      </div>

      {/* Footnote: stream-of-work analogy */}
      <p className="mt-8 max-w-3xl text-[14px] leading-[1.6] text-[color:var(--color-ink-soft)] italic">
        If these K buckets were workers in a streaming pipeline — packets in a
        rate limiter, beats in a measure, frames at a refresh rate — the modulo
        layout would always burst at the start of every cycle, then idle at the
        end. Bresenham keeps the load level throughout.
      </p>
    </div>
  );
}
