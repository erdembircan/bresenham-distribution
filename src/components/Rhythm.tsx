import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { euclideanRhythm, rotate, KNOWN_RHYTHMS } from '../lib/distribute';
import { Slider } from './Slider';
import { Tex } from './Tex';

const PRESETS: Array<{ steps: number; beats: number }> = [
  { steps: 8, beats: 3 },
  { steps: 8, beats: 5 },
  { steps: 9, beats: 4 },
  { steps: 12, beats: 5 },
  { steps: 12, beats: 7 },
  { steps: 7, beats: 3 },
  { steps: 16, beats: 4 },
  { steps: 16, beats: 9 },
];

type Colors = {
  paper: string;
  ink: string;
  inkMute: string;
  rule: string;
  rhythm: string;
  rhythmTint: string;
};

function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return {
    paper: cs.getPropertyValue('--color-paper').trim() || '#f5f1e8',
    ink: cs.getPropertyValue('--color-ink').trim() || '#1a1612',
    inkMute: cs.getPropertyValue('--color-ink-mute').trim() || '#8a7f72',
    rule: cs.getPropertyValue('--color-rule').trim() || '#c8bfae',
    rhythm: cs.getPropertyValue('--color-rhythm').trim() || '#b8860b',
    rhythmTint: cs.getPropertyValue('--color-rhythm-tint').trim() || 'rgba(184,134,11,0.12)',
  };
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  pattern: number[],
  active: number,
  W: number,
  H: number,
  colors: Colors,
) {
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) / 2 - 50;
  const steps = pattern.length;

  ctx.clearRect(0, 0, W, H);

  // Outer guide circle (faint)
  ctx.strokeStyle = colors.rule;
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Onset polygon
  const onsets: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    if (pattern[i]) {
      onsets.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
  }
  if (onsets.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(onsets[0].x, onsets[0].y);
    for (let i = 1; i < onsets.length; i++) ctx.lineTo(onsets[i].x, onsets[i].y);
    ctx.closePath();
    ctx.fillStyle = colors.rhythmTint;
    ctx.fill();
    ctx.strokeStyle = colors.rhythm;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  // Step dots
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const isOnset = pattern[i] === 1;
    const isActive = i === active;

    if (isActive) {
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fillStyle = isOnset ? colors.rhythmTint : 'rgba(26,22,18,0.06)';
      ctx.fill();
    }

    ctx.beginPath();
    const r = isOnset ? (isActive ? 9 : 7) : isActive ? 5 : 3;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (isOnset) {
      ctx.fillStyle = colors.rhythm;
      ctx.fill();
      ctx.strokeStyle = colors.paper;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    } else {
      ctx.fillStyle = colors.paper;
      ctx.fill();
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Step number
    const labelR = radius + 22;
    const lx = cx + Math.cos(angle) * labelR;
    const ly = cy + Math.sin(angle) * labelR;
    ctx.fillStyle = isActive ? colors.ink : colors.inkMute;
    ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), lx, ly);
  }
}

export function Rhythm() {
  const [steps, setSteps] = useState(8);
  const [rawBeats, setBeats] = useState(3);
  const [bpm, setBpm] = useState(120);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(-1);

  // Beats can never exceed steps — clamp on read, no effect needed
  const beats = Math.min(rawBeats, steps);

  const presetKey = `${beats},${steps}`;
  const preset = KNOWN_RHYTHMS[presetKey];

  const rawPattern = useMemo(
    () => euclideanRhythm(beats, steps),
    [beats, steps],
  );

  // Apply music-convention rotation when there's a known downbeat
  const pattern = useMemo(
    () => (preset ? rotate(rawPattern, preset.downbeat) : rawPattern),
    [rawPattern, preset],
  );

  // Canvas drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    drawCircle(ctx, pattern, active, cssW, cssH, readColors());
  }, [pattern, active]);

  // Audio
  const playOnset = useCallback((isOnset: boolean) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (isOnset) {
      // Kick-ish: sine pitch sweep with quick decay
      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      // Soft click for rest
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    setActive(-1);
    stepRef.current = -1;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    setPlaying(true);
    stepRef.current = -1;

    const tick = () => {
      stepRef.current = (stepRef.current + 1) % pattern.length;
      const stepDur = (60 / bpm) * (4 / pattern.length) * 1000;
      const isOnset = pattern[stepRef.current] === 1;
      playOnset(isOnset);
      setActive(stepRef.current);
      timerRef.current = window.setTimeout(tick, stepDur);
    };
    tick();
  }, [bpm, pattern, playOnset]);

  // Stop on unmount
  useEffect(() => () => stop(), [stop]);

  // Restart on pattern/bpm change while playing
  useEffect(() => {
    if (!playing) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    stepRef.current = -1;
    const tick = () => {
      stepRef.current = (stepRef.current + 1) % pattern.length;
      const stepDur = (60 / bpm) * (4 / pattern.length) * 1000;
      playOnset(pattern[stepRef.current] === 1);
      setActive(stepRef.current);
      timerRef.current = window.setTimeout(tick, stepDur);
    };
    tick();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [pattern, bpm, playing, playOnset]);

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12">
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PRESETS.map(({ steps: s, beats: b }) => {
            const k = `${b},${s}`;
            const known = KNOWN_RHYTHMS[k];
            const isActive = s === steps && b === beats;
            return (
              <button
                key={k}
                onClick={() => {
                  setSteps(s);
                  setBeats(b);
                }}
                className="cursor-pointer border px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.12em] transition-colors"
                style={{
                  borderColor: isActive ? 'var(--color-rhythm)' : 'var(--color-rule)',
                  color: isActive ? 'var(--color-rhythm)' : 'var(--color-ink-soft)',
                  background: isActive ? 'var(--color-rhythm-tint)' : 'transparent',
                }}
              >
                {known ? known.name : `E(${b},${s})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-warm)]/30 p-6">
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ height: '380px' }}
          />
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-5 flex flex-col gap-7">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
            Now playing
          </p>
          <h3
            className="mt-2 text-[26px] leading-tight tracking-[-0.01em]"
            style={{ color: 'var(--color-rhythm)', fontVariationSettings: '"opsz" 60' }}
          >
            {preset ? preset.name : 'Custom rhythm'}
          </h3>
          <p className="mt-1 text-[14px] text-[color:var(--color-ink-soft)] italic">
            {preset ? preset.origin : 'Drag the sliders to design a new pattern.'}
          </p>
          <p className="mt-4 text-[16px]">
            <Tex tex={`E(${beats}, ${steps})`} />
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-[color:var(--color-rule)] pt-5">
          <Slider label="Steps" symbol="N" value={steps} min={2} max={16} reserveWidth={200} accent="rhythm" onChange={setSteps} />
          <Slider label="Beats" symbol="K" value={beats} min={1} max={steps} reserveWidth={200} accent="rhythm" onChange={(v) => setBeats(Math.min(v, steps))} />
          <Slider label="Tempo" symbol="bpm" value={bpm} min={60} max={200} reserveWidth={200} accent="rhythm" onChange={setBpm} />
        </div>

        <button
          onClick={() => (playing ? stop() : start())}
          className="self-start cursor-pointer border px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors"
          style={{
            borderColor: 'var(--color-rhythm)',
            background: playing ? 'var(--color-rhythm)' : 'transparent',
            color: playing ? 'var(--color-paper)' : 'var(--color-rhythm)',
          }}
        >
          {playing ? '■  Stop' : '▸  Play'}
        </button>
      </aside>

      <div className="col-span-12 mt-2">
        <div className="border-t border-[color:var(--color-rule)] pt-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
              Linear timeline &middot; one cycle
            </p>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]"
              data-tabular
            >
              {pattern.filter((p) => p).length} onsets &middot; {pattern.length} steps
            </p>
          </div>

          <div className="flex items-stretch gap-[3px] h-16">
            {pattern.map((p, i) => {
              const isOnset = p === 1;
              const isActive = i === active;
              return (
                <div
                  key={i}
                  className="flex-1 relative transition-all duration-75"
                  style={{
                    background: isOnset ? 'var(--color-rhythm)' : 'transparent',
                    border: `1px solid ${isOnset ? 'var(--color-rhythm)' : 'var(--color-rule)'}`,
                    transform: isActive ? 'scaleY(1.08)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                    boxShadow: isActive
                      ? `0 0 0 2px var(--color-paper), 0 0 0 3px ${isOnset ? 'var(--color-rhythm)' : 'var(--color-ink-mute)'}`
                      : 'none',
                  }}
                  title={`step ${i + 1}: ${isOnset ? 'onset' : 'rest'}`}
                />
              );
            })}
          </div>
          <div className="flex items-stretch gap-[3px] mt-2">
            {pattern.map((_, i) => (
              <div
                key={i}
                className="flex-1 text-center font-mono text-[9px]"
                data-tabular
                style={{
                  color: i === active ? 'var(--color-rhythm)' : 'var(--color-ink-mute)',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
