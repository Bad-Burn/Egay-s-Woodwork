import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/Reveal';

const CHAPTERS = [
  {
    n: '01',
    t: 'The craft',
    body: [
      'Based in Paete, Laguna — long known as the woodcarving capital of the Philippines — Egay’s Woodwork is built on decades of hands-on experience shaping solid wood into carvings, trophies, and sculpture.',
      'Every piece is made by hand, blending traditional carving technique with a careful eye for proportion, finish, and durability. The result is woodwork meant to be used, displayed, and passed down.',
    ],
  },
  {
    n: '02',
    t: 'What we make',
    body: [
      'The workshop takes on four kinds of work: hand-carved wood pieces, trophies and awards turned and carved from solid wood, engraved name plates for desks and tables, and sculpture carved in styrofoam.',
      'All four are open for commission. Send your design, wording, or dimensions and we build to order.',
    ],
  },
];

// Mirrors the gallery categories — these are the commissions we actually take.
const OFFERINGS = [
  ['Wood Carving', 'Figures, reliefs, and detailed carved work in solid hardwood.'],
  ['Wooden Trophy', 'Awards and trophies carved and finished for events and competitions.'],
  ['Name Plate', 'Engraved desk and table name plates, cut and lettered to order.'],
  ['Styrofoam Sculpture', 'Lightweight sculpture and display pieces carved in styrofoam.'],
];

const MARKS = [
  'Genuine handcrafted work from skilled Paete artisans',
  'Solid, carefully selected hardwood built to last',
  'Commissions built to your design, wording, and size',
  'Generations of woodcarving tradition and expertise',
];

const FACTS = [
  ['Based in', 'Paete, Laguna'],
  ['Discipline', 'Carving · Trophies · Name plates'],
  ['Notable', 'Grand Winner — Paete Wood Carving Competition, 2018'],
  ['Commissions', 'Open'],
];

export default function About() {
  return (
    <div className="pt-28 md:pt-36">
      {/* ── Masthead ───────────────────────────────────────────── */}
      <header className="mx-auto max-w-editorial px-5 sm:px-8">
        <p className="eyebrow-rule">The studio</p>
        <h1 className="mt-5 max-w-4xl font-serif text-display font-normal">
          A workshop
          <br />
          <span className="italic text-brass">in Paete.</span>
        </h1>
        <p className="lede mt-10 max-w-prose">
          Handcrafted woodwork from the woodcarving capital of the Philippines —
          made slowly, by hand, one piece at a time.
        </p>
      </header>

      {/* ── Portrait ───────────────────────────────────────────── */}
      <Reveal className="mx-auto mt-16 max-w-editorial px-5 sm:px-8 md:mt-24">
        <div className="relative aspect-[16/9] overflow-hidden bg-canvas md:aspect-[21/9]">
          <Image
            src="/images/Egay2.jpg"
            alt="Egay at work in the Paete workshop"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-label text-ink/35">
          Photo — June Reymart C. Bague
        </p>
      </Reveal>

      {/* ── Facts strip ────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-editorial px-5 sm:px-8 md:mt-28">
        <div className="grid gap-px border-y border-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map(([label, value], i) => (
            <Reveal key={label} delay={i * 90} className="py-7 pr-6">
              <p className="text-[10px] uppercase tracking-label text-ink/40">{label}</p>
              <p className="mt-2.5 font-serif text-lg leading-snug">{value}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Chapters ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-editorial px-5 py-24 sm:px-8 md:py-32">
        {CHAPTERS.map((c) => (
          <Reveal
            key={c.n}
            className="grid gap-8 border-t border-ink/10 py-14 md:grid-cols-[auto_1fr] md:gap-20 md:py-20"
          >
            <div className="md:w-48">
              <span className="text-xs tracking-label text-brass">{c.n}</span>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl">{c.t}</h2>
            </div>
            <div className="max-w-prose space-y-6">
              {c.body.map((p, i) => (
                <p key={i} className="text-lg font-light leading-relaxed text-ink/70">
                  {p}
                </p>
              ))}

              {/* Spell the four commission types out under "What we make". */}
              {c.n === '02' && (
                <ul className="grid gap-px pt-4 sm:grid-cols-2">
                  {OFFERINGS.map(([name, note]) => (
                    <li key={name} className="border-t border-ink/10 py-5 pr-6">
                      <p className="font-serif text-xl">{name}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink/55">{note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}

        {/* Why choose us */}
        <Reveal className="grid gap-8 border-y border-ink/10 py-14 md:grid-cols-[auto_1fr] md:gap-20 md:py-20">
          <div className="md:w-48">
            <span className="text-xs tracking-label text-brass">03</span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Why us</h2>
          </div>
          <ul className="max-w-prose">
            {MARKS.map((m) => (
              <li
                key={m}
                className="flex gap-5 border-b border-ink/8 py-5 text-lg font-light leading-relaxed text-ink/70 last:border-0"
              >
                <span aria-hidden className="text-brass">—</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-editorial px-5 py-24 sm:px-8 md:py-36">
          <Reveal className="max-w-3xl">
            <p className="eyebrow-rule text-brass-light">Get in touch</p>
            <h2 className="mt-6 font-serif text-display-sm text-paper">
              Let&apos;s build something
              <br />
              <span className="italic text-brass-light">in wood.</span>
            </h2>
            <p className="mt-8 max-w-prose text-lg font-light leading-relaxed text-paper/65">
              Interested in a piece from the collection, or planning a commission?
              We&apos;d like to hear about it.
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/contact" className="btn bg-brass text-ink hover:bg-paper">
                Contact the studio
              </Link>
              <Link href="/gallery" className="btn-ghost">
                See the collection
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
