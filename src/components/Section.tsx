import type { ReactNode } from 'react';

type Props = {
  fig: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  accent?: 'bres' | 'mod' | 'rhythm' | 'ink';
  children: ReactNode;
};

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  bres: 'var(--color-bres)',
  mod: 'var(--color-mod)',
  rhythm: 'var(--color-rhythm)',
  ink: 'var(--color-ink)',
};

export function Section({ fig, eyebrow, title, lede, accent = 'ink', children }: Props) {
  return (
    <section className="relative py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--color-rule)]" />
      <header className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-12 lg:col-span-3">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: ACCENT[accent] }}
          >
            {fig}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink-mute)]">
            {eyebrow}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-[40px] leading-[1.05] tracking-[-0.015em] text-[color:var(--color-ink)]">
            {title}
          </h2>
          {lede && (
            <p className="mt-4 max-w-2xl text-[17px] leading-[1.55] text-[color:var(--color-ink-soft)]">
              {lede}
            </p>
          )}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}
