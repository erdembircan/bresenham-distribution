# Bresenham, repurposed

> *The four lines find you.*

An interactive companion to the essay
[**Cuban Music, Neutron Pulses, and a 1965 Plotter**](https://erdembircan.com/blog/cuban-music-neutron-pulses-1965-plotter)
on convergent discovery in mathematics.

This page demonstrates that one tiny algorithm — **four lines of code from
1965** — solves three problems that look completely unrelated:

- drawing a straight line on a digital plotter,
- distributing $N$ items across $K$ buckets as evenly as possible, and
- generating the rhythm of the Cuban tresillo (and most other iconic
  rhythms in world music).

The same arithmetic was independently discovered three times — by Jack
Bresenham at IBM in 1965, by Eric Bjorklund at Los Alamos in 2003, and by
Godfried Toussaint studying world music in 2005 — by people who had not read
each other's work and were not trying to solve each other's problems. They
arrived at the same expression because the math was waiting for whoever
asked the question first.

## What you can do here

Three figures, each interactive:

### Fig. I — The geometry

Watch a straight line drawn on a $K \times N$ grid get rasterized into a
staircase, then watch the lit cells fall down into a bar chart. The number
of new rows the line lights in each column is the bucket distribution. A
rasterizer and a fair-distribution algorithm are the same algorithm, drawn
twice.

### Fig. II — The contrast

Compare the **modulo spread** (the obvious "first $R$ buckets get base + 1"
approach) against **Bresenham's distribution** side-by-side. Both produce
the same total. Both have the same number of "extras." But the extras land
in completely different places: clumped at the front of the cycle vs.
maximally spread across it. The gap-spread metric tells the story —
typically `5` for modulo and `1` for Bresenham on the same input.

### Fig. III — The third rediscovery

Run the same arithmetic on small numbers and play it through your speakers.
$E(3, 8)$ — three beats across eight steps — is the Cuban *tresillo*. $E(5,
8)$ is the *cinquillo*. $E(4, 9)$ is the Turkish *aksak*. $E(7, 12)$ is a
West African bell pattern. Drag the sliders to design your own; every preset
button names a rhythm that real musicians have been playing for centuries
without knowing the four lines existed.

## The expression

Every figure on this page is driven by the same closed form:

$$
\text{bucket}[i] = \left\lfloor \frac{N(i+1)}{K} \right\rfloor - \left\lfloor \frac{N \cdot i}{K} \right\rfloor \quad \text{for } i = 0, 1, \dots, K-1
$$

That is the entire algorithm. Two integer divisions, one subtraction, run
$K$ times.

## Why this exists

The point isn't to advocate for Bresenham as a load-balancing primitive
(though you could, and at least one production system has). The point is to
show, viscerally, that **mathematics is real** — that when a problem sits
at a genuine bottleneck, smart people who look at it seriously will find
the same answer regardless of vocabulary, decade, or field. There is one
most-elegant way to distribute $K$ things across $N$ positions without
floats, and the world keeps re-deriving it.

The four lines find you.

## Local

```sh
npm install
npm run dev      # interactive demo at http://localhost:5173
npm test         # algorithm invariants
```

## Credits

- Jack E. Bresenham — *Algorithm for computer control of a digital plotter*, IBM Systems Journal (1965)
- Eric Bjorklund — *The Theory of Rep-Rate Pattern Generation in the SNS Timing System*, LANL (2003)
- Godfried Toussaint — *The Euclidean Algorithm Generates Traditional Musical Rhythms* (2005)
- Robert K. Merton — *Singletons and Multiples in Scientific Discovery* (1961), the multiples thesis that frames the whole story
