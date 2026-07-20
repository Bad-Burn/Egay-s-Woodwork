'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { CATEGORIES } from '@/lib/categories';

const SORTS = {
  newest: 'Newest first',
  'price-low': 'Price — low to high',
  'price-high': 'Price — high to low',
  title: 'Title — A to Z',
};

// Rotating aspect ratios give the masonry column layout its editorial rhythm.
const RATIOS = ['aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/4]', 'aspect-[5/4]', 'aspect-[4/5]', 'aspect-[7/8]'];

function statusTone(status) {
  if (status === 'Sold') return 'text-ink/35';
  if (status === 'Reserved') return 'text-amber-700';
  if (status === 'Display') return 'text-brass';
  return 'text-emerald-700';
}

function priceLabel(item) {
  if (item.status === 'Display') return 'On display';
  const value = parseFloat(item.price);
  if (!value) return 'Price on request';
  return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
}

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('newest');
  const [availableOnly, setAvailableOnly] = useState(false);

  const categories = ['All', ...CATEGORIES];

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch('/api/artworks');
        const data = await res.json();
        setArtworks(data.artworks || []);
      } catch (error) {
        console.error('Failed to fetch pieces:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const list = artworks.filter((a) => {
      const matchCategory =
        selectedCategory === 'All' || a.category === selectedCategory;
      const matchSearch =
        a.title.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term);
      const matchAvailable = !availableOnly || a.status === 'Available';
      return matchCategory && matchSearch && matchAvailable;
    });

    const sorted = [...list];
    switch (sort) {
      case 'price-low':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return sorted;
  }, [artworks, selectedCategory, searchTerm, sort, availableOnly]);

  const hasFilters =
    selectedCategory !== 'All' || searchTerm !== '' || availableOnly;

  return (
    <div className="pt-28 md:pt-36">
      {/* ── Masthead ───────────────────────────────────────────── */}
      <header className="mx-auto max-w-editorial px-5 sm:px-8">
        <p className="eyebrow-rule">The collection</p>
        <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <h1 className="font-serif text-display font-normal">
            Work
          </h1>
          <p className="max-w-prose pb-3 text-ink/55 leading-relaxed md:text-right">
            Carvings, trophies, name plates, and sculpture — each piece made
            by hand and listed as it leaves the workshop.
          </p>
        </div>
      </header>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 mt-12 border-y border-ink/10 bg-paper/85 backdrop-blur-xl md:mt-16">
        <div className="mx-auto max-w-editorial px-5 sm:px-8">
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            {/* Categories */}
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`chip flex-shrink-0 ${
                    selectedCategory === category ? 'chip-active' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search + sort — stacks on small screens so nothing is clipped. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search pieces"
                className="field py-2 text-sm sm:w-36 lg:w-48"
              />
              <div className="flex items-center justify-between gap-5 sm:justify-start">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="field w-auto max-w-[55%] cursor-pointer py-2 text-sm sm:max-w-none"
                  aria-label="Sort pieces"
                >
                  {Object.entries(SORTS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
                <label className="flex flex-shrink-0 cursor-pointer select-none items-center gap-2 text-xs uppercase tracking-wider text-ink/50">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="h-3.5 w-3.5 accent-brass"
                  />
                  Available
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-editorial px-5 pb-28 sm:px-8">
        {!loading && (
          <p className="py-6 text-[11px] uppercase tracking-label text-ink/40">
            {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setAvailableOnly(false);
                }}
                className="ml-4 underline underline-offset-4 hover:text-ink"
              >
                Clear filters
              </button>
            )}
          </p>
        )}

        {loading ? (
          <div className="gap-8 pt-6 sm:columns-2 lg:columns-3">
            {RATIOS.map((r, i) => (
              <div key={i} className="mb-10 break-inside-avoid">
                <div className={`skeleton ${r}`} />
                <div className="skeleton mt-5 h-5 w-2/3" />
                <div className="skeleton mt-2 h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="gap-8 sm:columns-2 lg:columns-3">
            {filtered.map((item, i) => (
              <Reveal
                key={item.id}
                delay={(i % 3) * 100}
                className="mb-10 break-inside-avoid md:mb-14"
              >
                <Link href={`/gallery/${item.id}`} className="group block">
                  <div className={`relative overflow-hidden bg-canvas ${RATIOS[i % RATIOS.length]}`}>
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="media-zoom"
                    />
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/15" />

                    {/* Caption slides up on hover (desktop). */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-3 bg-gradient-to-t from-ink/85 to-transparent p-5 opacity-0 transition-all duration-500 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 md:block">
                      <p className="text-[10px] uppercase tracking-label text-paper/70">
                        {item.medium || item.category}
                      </p>
                      <p className="mt-1 font-sans text-sm text-paper">View piece →</p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-ink/10 pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-serif text-xl tracking-tight transition-colors duration-300 group-hover:text-brass sm:text-2xl">
                        {item.title}
                      </h2>
                      <span className={`flex-shrink-0 text-[10px] uppercase tracking-label ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-4">
                      <p className="text-[11px] uppercase tracking-label text-ink/40">
                        {item.category} · {item.year_created}
                      </p>
                      <p className="font-sans text-sm text-ink/70">{priceLabel(item)}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border-t border-ink/10 py-28 text-center">
            <h2 className="font-serif text-3xl">Nothing matches</h2>
            <p className="mt-3 text-ink/50">Try a different category or clear the filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setAvailableOnly(false);
              }}
              className="btn-outline mt-8"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
