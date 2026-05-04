import './Slider.css';

type Props = {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  accent?: 'bres' | 'mod' | 'rhythm' | 'ink';
  onChange: (v: number) => void;
};

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  bres: 'var(--color-bres)',
  mod: 'var(--color-mod)',
  rhythm: 'var(--color-rhythm)',
  ink: 'var(--color-ink)',
};

export function Slider({
  label,
  symbol,
  value,
  min,
  max,
  step = 1,
  accent = 'ink',
  onChange,
}: Props) {
  return (
    <label className="flex flex-col gap-2 select-none">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
        {label}
        {symbol && <span className="ml-1.5 normal-case italic">{symbol}</span>}
      </span>
      <span className="flex items-baseline gap-3">
        <span
          className="font-serif text-[28px] leading-none inline-block text-right"
          style={{
            fontVariationSettings: '"opsz" 60, "SOFT" 60',
            color: ACCENT[accent],
            minWidth: `${String(max).length}ch`,
          }}
          data-tabular
        >
          {value}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="paper-slider w-44"
          style={{ ['--slider-accent' as string]: ACCENT[accent] }}
        />
      </span>
    </label>
  );
}
