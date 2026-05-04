import { Section } from './components/Section';
import { LineProof } from './components/LineProof';
import { Comparison } from './components/Comparison';
import { Rhythm } from './components/Rhythm';
import { Tex } from './components/Tex';

function App() {
  return (
    <div className="mx-auto max-w-[68rem] px-10">
      <header className="pt-20 pb-16">
        <div className="flex items-baseline justify-between gap-8 border-b border-[color:var(--color-rule)] pb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            Convergent Discovery &middot; Vol. I
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            IBM 1965 &middot; LANL 2003 &middot; Toussaint 2005
          </p>
        </div>
        <h1
          className="display mt-10 text-[80px] leading-[0.92] tracking-[-0.025em] text-[color:var(--color-ink)]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 80' }}
        >
          The four lines<br />
          <em
            className="italic text-[color:var(--color-bres)]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
          >
            find&nbsp;you.
          </em>
        </h1>
        <div className="mt-10 grid grid-cols-12 gap-8">
          <p className="col-span-12 lg:col-span-7 text-[18px] leading-[1.55] text-[color:var(--color-ink-soft)]">
            One algorithm — four lines of code — discovered three times for three
            different problems. A 1965 plotter routine becomes the fairest way
            to spread one&nbsp;hundred jobs across seven workers, and the same math
            generates the rhythm of the Cuban tresillo. When a problem sits at a
            real bottleneck, the math waits there for whoever asks first.
          </p>
          <aside className="col-span-12 lg:col-span-5 border-l border-[color:var(--color-rule)] pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
              The four lines
            </p>
            <div className="mt-3 text-[color:var(--color-ink)] text-[18px] leading-tight">
              <Tex
                tex={`\\text{bucket}[i] = \\left\\lfloor \\tfrac{N(i+1)}{K} \\right\\rfloor - \\left\\lfloor \\tfrac{N i}{K} \\right\\rfloor`}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink-mute)]">
              for{' '}
              <span className="normal-case">
                <Tex tex="i = 0, 1, \dots, K-1" />
              </span>
            </p>
          </aside>
        </div>
      </header>

      <Section
        fig="Fig. I"
        eyebrow="The geometry"
        accent="bres"
        title={
          <>
            A line, rasterized.
            <br />
            <em className="italic text-[color:var(--color-bres)]">A distribution, revealed.</em>
          </>
        }
        lede={
          <>
            Draw a straight line on a K×N grid. The number of new rows the line
            lights in each column is the bucket count. The fair distribution you
            wanted is the staircase rasterization of a perfectly straight line.
          </>
        }
      >
        <LineProof />
      </Section>

      <Section
        fig="Fig. II"
        eyebrow="The contrast"
        accent="mod"
        title={
          <>
            Modulo spread <span className="text-[color:var(--color-ink-mute)]">vs.</span>{' '}
            <em className="italic text-[color:var(--color-bres)]">Bresenham.</em>
          </>
        }
        lede={
          <>
            Both produce the same total, both have the same number of "extras."
            The difference is where the extras land — clumped at the front, or
            spread across the cycle.
          </>
        }
      >
        <Comparison />
      </Section>

      <Section
        fig="Fig. III"
        eyebrow="The third rediscovery"
        accent="rhythm"
        title={
          <>
            The same math <em className="italic text-[color:var(--color-rhythm)]">makes music.</em>
          </>
        }
        lede={
          <>
            In 2005, Godfried Toussaint noticed that the Euclidean spacing of K
            beats across N steps reproduces nearly every iconic rhythm in world
            music. Distribute beats as evenly as possible — that is groove.
          </>
        }
      >
        <Rhythm />
      </Section>

      <footer className="mt-12 border-t border-[color:var(--color-rule)] py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
          Where else the four lines appear
        </p>
        <p className="mt-4 max-w-3xl text-[15px] leading-[1.7] text-[color:var(--color-ink-soft)]">
          Stepper-motor firmware (Marlin, Grbl) for coordinating axes &middot; AC power
          controllers using cycle-skipping &middot; LED PWM dimmers spreading on-cycles to
          avoid flicker &middot; MIDI clock subdivisions &middot; nginx smooth-weighted
          round-robin &middot; Floyd–Steinberg image dithering &middot; PID controllers tracking
          accumulated error.
        </p>

        <div className="mt-12 flex items-baseline justify-between gap-6 border-t border-[color:var(--color-rule-faint)] pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            Erdem Bircan &middot; 2026
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)] italic">
            Set in Fraunces &amp; IBM Plex Mono
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
