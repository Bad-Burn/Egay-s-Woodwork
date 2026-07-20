'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Reveal from '@/components/Reveal';

const CRAFT = [
  {
    n: '01',
    t: 'Solid wood',
    d: 'Narra, acacia, and santol, chosen board by board for grain and stability.',
  },
  {
    n: '02',
    t: 'Hand-carved',
    d: 'Cut, shaped, and finished by hand — chisel work, never machine-stamped.',
  },
  {
    n: '03',
    t: 'Made to order',
    d: 'Carvings, trophies, name plates, and styrofoam sculpture — built to your size, wording, and design.',
  },
];

function priceLabel(item) {
  if (item.status === 'Display') return 'On display';
  const value = parseFloat(item.price);
  if (!value) return 'Price on request';
  return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/artworks?limit=5');
        const data = await res.json();
        setFeatured(data.artworks || []);
      } catch (error) {
        console.error('Failed to fetch pieces:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const [lead, ...rest] = featured;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
        <Image
          src="/images/Egay2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/70" />

        <div className="relative z-10 mx-auto w-full max-w-editorial px-5 pb-16 sm:px-8 sm:pb-20 md:pb-28">
          <div className="animate-fade-in-up">
            <p className="eyebrow-rule text-brass-light">
              Est. Paete, Laguna
            </p>

            <h1 className="mt-6 max-w-4xl font-serif text-display font-normal text-paper">
              Handcrafted
              <br />
              <span className="italic text-brass-light">in wood.</span>
            </h1>

            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-prose text-base font-light leading-relaxed text-paper/70 sm:text-lg">
                Carvings, trophies, name plates, and sculpture shaped by hand in
                the woodcarving capital of the Philippines — where a piece takes
                as long as it takes.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/gallery" className="btn bg-paper text-ink hover:bg-brass">
                  View the collection
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Commission a piece
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="absolute bottom-4 right-5 z-10 text-[10px] uppercase tracking-label text-paper/35 sm:right-8">
          Photo — June Reymart C. Bague
        </p>
      </section>

      {/* ── Marquee ────────────────────────────────────────────── */}
      <section className="overflow-hidden border-b border-ink/8 bg-canvas py-4">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-10" aria-hidden={dup === 1}>
              {['Wood carving', 'Wooden trophies', 'Name plates', 'Styrofoam sculpture', 'Commissions'].map(
                (word) => (
                  <span
                    key={word}
                    className="flex items-center gap-10 text-[11px] uppercase tracking-label text-ink/45"
                  >
                    {word}
                    <span className="h-1 w-1 rounded-full bg-brass/60" />
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured work ──────────────────────────────────────── */}
      <section id="work" className="mx-auto max-w-editorial px-5 py-24 sm:px-8 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow-rule">Selected work</p>
            <h2 className="mt-5 font-serif text-display-sm">
              Recent pieces
            </h2>
          </div>
          <Link href="/gallery" className="link-underline uppercase tracking-label text-xs text-ink/60 hover:text-ink">
            All work
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="skeleton aspect-[4/5]" />
              <div className="grid gap-6">
                <div className="skeleton aspect-[16/10]" />
                <div className="skeleton aspect-[16/10]" />
              </div>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {/* Lead piece — tall, sets the editorial rhythm. */}
              <Reveal>
                <FeatureCard item={lead} priority ratio="aspect-[4/5]" size="lg" />
              </Reveal>

              <div className="grid gap-6 md:gap-8">
                {rest.slice(0, 2).map((item, i) => (
                  <Reveal key={item.id} delay={120 + i * 120}>
                    <FeatureCard item={item} ratio="aspect-[16/11]" />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-ink/50">No pieces published yet.</p>
          )}
        </div>
      </section>

      {/* ── Craft ──────────────────────────────────────────────── */}
      <section className="border-y border-ink/8 bg-canvas">
        <div className="mx-auto max-w-editorial px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow-rule">The craft</p>
              <h2 className="mt-5 font-serif text-display-sm">
                Every piece begins
                <br />
                <span className="italic text-brass">as a plank.</span>
              </h2>
              <p className="lede mt-8 max-w-prose">
                No two pieces leave the workshop the same. The grain decides
                where the cut goes; the hand decides the rest.
              </p>
              <Link href="/about" className="link-underline mt-10 text-ink">
                About the studio <span aria-hidden>→</span>
              </Link>
            </Reveal>

            <div>
              {CRAFT.map((f, i) => (
                <Reveal
                  key={f.n}
                  delay={i * 120}
                  className="grid grid-cols-[auto_1fr] gap-6 border-t border-ink/10 py-8 last:border-b sm:gap-10"
                >
                  <span className="font-sans text-xs tracking-label text-brass">{f.n}</span>
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl">{f.t}</h3>
                    <p className="mt-3 max-w-prose leading-relaxed text-ink/60">{f.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Commission CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto max-w-editorial px-5 py-28 sm:px-8 md:py-40">
          <Reveal className="max-w-3xl">
            <p className="eyebrow-rule text-brass-light">Commissions open</p>
            <h2 className="mt-6 font-serif text-display-sm text-paper">
              Have something
              <br />
              <span className="italic text-brass-light">in mind?</span>
            </h2>
            <p className="mt-8 max-w-prose text-lg font-light leading-relaxed text-paper/65">
              A carved figure, a trophy for your event, a name plate for a desk,
              or a sculpture in styrofoam — tell us the idea and we&apos;ll tell
              you what it takes to make.
            </p>
            <Link href="/contact" className="btn mt-12 bg-brass text-ink hover:bg-paper">
              Start a commission
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ item, ratio, size = 'md', priority = false }) {
  if (!item) return null;

  return (
    <Link href={`/gallery/${item.id}`} className="group block">
      <div className={`relative ${ratio} overflow-hidden bg-canvas`}>
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="media-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
        <div>
          <h3
            className={`font-serif tracking-tight transition-colors duration-300 group-hover:text-brass ${
              size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl'
            }`}
          >
            {item.title}
          </h3>
          <p className="mt-1.5 text-[11px] uppercase tracking-label text-ink/40">
            {item.category} · {item.year_created}
          </p>
        </div>
        <p className="whitespace-nowrap font-sans text-sm text-ink/70">{priceLabel(item)}</p>
      </div>
    </Link>
  );
}
