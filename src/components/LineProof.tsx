import { useEffect, useRef, useState } from 'react';
import { bresenham } from '../lib/distribute';
import { Slider } from './Slider';

const BUILD_MS = 2200;
const HOLD_MS = 500;
const FALL_MS = 1000;
const TOTAL = BUILD_MS + HOLD_MS + FALL_MS;
const BUILD_END = BUILD_MS / TOTAL;
const HOLD_END = (BUILD_MS + HOLD_MS) / TOTAL;

type Colors = {
  ink: string;
  rule: string;
  bres: string;
  bresTint: string;
  inkMute: string;
};

function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return {
    ink: cs.getPropertyValue('--color-ink').trim() || '#1a1612',
    rule: cs.getPropertyValue('--color-rule').trim() || '#c8bfae',
    bres: cs.getPropertyValue('--color-bres').trim() || '#2f6b3f',
    bresTint: 'rgba(47, 107, 63, 0.18)',
    inkMute: cs.getPropertyValue('--color-ink-mute').trim() || '#8a7f72',
  };
}

function drawProof(
  ctx: CanvasRenderingContext2D,
  t: number,
  n: number,
  k: number,
  W: number,
  H: number,
  colors: Colors,
) {
  const padX = 60;
  const padTop = 30;
  const padBottom = 70;
  const cell = Math.floor(Math.min((W - 2 * padX) / k, (H - padTop - padBottom) / n));
  const gridW = cell * k;
  const gridH = cell * n;
  const gridX = Math.floor((W - gridW) / 2);
  const gridY = padTop;

  ctx.clearRect(0, 0, W, H);

  // Pencil grid
  ctx.strokeStyle = colors.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= k; i++) {
    ctx.moveTo(gridX + i * cell, gridY);
    ctx.lineTo(gridX + i * cell, gridY + gridH);
  }
  for (let j = 0; j <= n; j++) {
    ctx.moveTo(gridX, gridY + j * cell);
    ctx.lineTo(gridX + gridW, gridY + j * cell);
  }
  ctx.stroke();

  const dist = bresenham(n, k);

  const buildT = Math.min(1, t / BUILD_END);
  const fallT = t > HOLD_END ? Math.min(1, (t - HOLD_END) / (1 - HOLD_END)) : 0;
  const eased = 1 - Math.pow(1 - fallT, 3);

  if (fallT > 0) {
    // Phase 3 — bright cells fall to bottom of column
    for (let i = 0; i < k; i++) {
      const cumulative = Math.floor((n * (i + 1)) / k);
      for (let row = 0; row < cumulative; row++) {
        const x = gridX + i * cell;
        const y = gridY + gridH - (row + 1) * cell;
        ctx.fillStyle = colors.bresTint;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
    for (let i = 0; i < k; i++) {
      const previousHeight = i > 0 ? Math.floor((n * i) / k) : 0;
      const newCount = dist[i];
      for (let j = 0; j < newCount; j++) {
        const originalRow = previousHeight + j;
        const targetRow = j;
        const row = originalRow + (targetRow - originalRow) * eased;
        const x = gridX + i * cell;
        const y = gridY + gridH - (row + 1) * cell;
        ctx.fillStyle = colors.bres;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
      ctx.fillStyle = colors.bres;
      ctx.font = 'bold 13px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(dist[i]), gridX + i * cell + cell / 2, gridY + gridH + 10);
    }
  } else {
    // Phase 1+2 — staircase build, then hold
    for (let i = 0; i < k; i++) {
      const colStartProgress = i / k;
      if (buildT < colStartProgress) break;

      const colEndProgress = (i + 1) / k;
      const colDone = buildT >= colEndProgress;
      const colT = colDone ? 1 : (buildT - colStartProgress) * k;

      const cumulative = Math.floor((n * (i + 1)) / k);
      const previousHeight = i > 0 ? Math.floor((n * i) / k) : 0;
      const newCount = cumulative - previousHeight;

      for (let row = 0; row < previousHeight; row++) {
        const x = gridX + i * cell;
        const y = gridY + gridH - (row + 1) * cell;
        ctx.fillStyle = colors.bresTint;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }

      const newShown = Math.ceil(colT * newCount);
      for (let j = 0; j < newShown; j++) {
        const row = previousHeight + j;
        const x = gridX + i * cell;
        const y = gridY + gridH - (row + 1) * cell;
        ctx.fillStyle = colors.bres;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }

      if (colDone) {
        ctx.fillStyle = colors.bres;
        ctx.font = 'bold 13px "IBM Plex Mono", ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(dist[i]), gridX + i * cell + cell / 2, gridY + gridH + 10);
      }
    }
  }

  // Diagonal line — drawn during build, persists after
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  ctx.moveTo(gridX, gridY + gridH);
  ctx.lineTo(gridX + buildT * gridW, gridY + gridH - buildT * gridH);
  ctx.stroke();

  // Corner labels
  ctx.fillStyle = colors.inkMute;
  ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('(0, 0)', gridX - 8, gridY + gridH - 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`(K = ${k}, N = ${n})`, gridX + gridW + 8, gridY + 2);

  // Caption
  ctx.fillStyle = colors.inkMute;
  ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('rows added per column = bucket distribution', W / 2, gridY + gridH + 36);
}

export function LineProof() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [n, setN] = useState(12);
  const [k, setK] = useState(5);
  const [playToken, setPlayToken] = useState(0);

  // Static end-state on mount + whenever N/K change. Animation only on Play.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = readColors();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (playToken === 0) {
      // Static final state
      drawProof(ctx, 1, n, k, cssW, cssH, colors);
      return;
    }

    startRef.current = null;
    const frame = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = Math.min(1, (now - startRef.current) / TOTAL);
      drawProof(ctx, t, n, k, cssW, cssH, colors);
      if (t < 1) animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [n, k, playToken]);

  // Distribute() result for the inline display
  const dist = Array.from({ length: k }, (_, i) =>
    Math.floor((n * (i + 1)) / k) - Math.floor((n * i) / k),
  );

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-9">
        <div className="rounded-sm border border-[color:var(--color-rule)] bg-[color:var(--color-paper-warm)]/40 p-6">
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ height: '460px' }}
          />
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <Slider
            label="Items"
            symbol="N"
            value={n}
            min={2}
            max={30}
            accent="bres"
            onChange={(v) => setN(Math.max(v, k))}
          />
          <Slider
            label="Buckets"
            symbol="K"
            value={k}
            min={2}
            max={15}
            accent="bres"
            onChange={(v) => setK(Math.min(v, n))}
          />
          <button
            onClick={() => setPlayToken((t) => t + 1)}
            className="self-start cursor-pointer border px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors"
            style={{
              borderColor: 'var(--color-bres)',
              background: 'transparent',
              color: 'var(--color-bres)',
            }}
          >
            ▸  {playToken === 0 ? 'Play animation' : 'Replay'}
          </button>
        </div>

        <div className="border-t border-[color:var(--color-rule)] pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
            Output
          </p>
          <p
            className="mt-2 font-mono text-[13px] leading-relaxed text-[color:var(--color-ink)] break-words"
            data-tabular
          >
            [{dist.join(', ')}]
          </p>
        </div>

        <div className="border-t border-[color:var(--color-rule)] pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
            Reading the figure
          </p>
          <p className="mt-3 text-[13px] leading-[1.6] text-[color:var(--color-ink-soft)]">
            Each column gets exactly the number of cells the line has lit up
            inside it. The columns <em>are</em> the buckets.
          </p>
        </div>
      </aside>
    </div>
  );
}
