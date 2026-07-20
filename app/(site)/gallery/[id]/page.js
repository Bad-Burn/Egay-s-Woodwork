'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Reveal from '@/components/Reveal';

function statusTone(status) {
  if (status === 'Sold') return 'border-ink/15 text-ink/40';
  if (status === 'Reserved') return 'border-amber-600/40 text-amber-700';
  if (status === 'Display') return 'border-brass/40 text-brass';
  return 'border-emerald-700/30 text-emerald-700';
}

export default function ArtworkDetails() {
  const params = useParams();
  const { id } = params;
  const [artwork, setArtwork] = useState(null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(`/api/artworks/${id}`);
        const data = await res.json();
        setArtwork(data.artwork);
      } catch (error) {
        console.error('Failed to fetch piece:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArtwork();
  }, [id]);

  // Sibling pieces for the "more work" strip at the foot of the page.
  useEffect(() => {
    const fetchMore = async () => {
      try {
        const res = await fetch('/api/artworks?limit=8');
        const data = await res.json();
        setMore((data.artworks || []).filter((a) => String(a.id) !== String(id)).slice(0, 3));
      } catch {
        setMore([]);
      }
    };
    if (id) fetchMore();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-editorial px-5 pt-32 sm:px-8 md:pt-40">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-5 pt-4">
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-40 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="eyebrow-rule justify-center">404</p>
        <h1 className="mt-5 font-serif text-display-sm">Piece not found</h1>
        <p className="mt-4 text-ink/50">It may have been removed from the collection.</p>
        <Link href="/gallery" className="btn-outline mt-10">Back to the collection</Link>
      </div>
    );
  }

  const price = parseFloat(artwork.price);
  const specs = [
    ['Category', artwork.category],
    ['Medium', artwork.medium],
    ['Dimensions', artwork.dimensions],
    ['Year', artwork.year_created],
  ];

  return (
    <article className="pt-28 md:pt-36">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <Link
          href="/gallery"
          className="link-underline text-ink/50 hover:text-ink"
        >
          <span aria-hidden>←</span> Collection
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-canvas shadow-frame">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Details — sticks alongside the image on large screens. */}
          <div className="lg:sticky lg:top-28 lg:self-start lg:pb-16">
            <span
              className={`inline-block rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-label ${statusTone(artwork.status)}`}
            >
              {artwork.status}
            </span>

            <h1 className="mt-6 font-serif text-display-sm font-normal">
              {artwork.title}
            </h1>

            {artwork.status !== 'Display' && (
              <p className="mt-6 font-sans text-2xl font-light text-ink/80">
                {price
                  ? `₱${price.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
                  : 'Price on request'}
              </p>
            )}

            {artwork.description && (
              <p className="mt-8 max-w-prose text-lg font-light leading-relaxed text-ink/70">
                {artwork.description}
              </p>
            )}

            {/* Spec table */}
            <dl className="mt-12">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-4 last:border-b"
                >
                  <dt className="text-[10px] uppercase tracking-label text-ink/40">{label}</dt>
                  <dd className="text-right font-sans text-sm text-ink/80">{value || '—'}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => setShowInquiryForm((s) => !s)}
                className="btn-primary"
                aria-expanded={showInquiryForm}
              >
                {showInquiryForm ? 'Close enquiry' : 'Enquire about this piece'}
              </button>
              <Link href="/contact" className="btn-outline">
                Commission similar
              </Link>
            </div>

            {showInquiryForm && (
              <div className="mt-10 animate-float-up border-t border-ink/10 pt-10">
                <InquiryForm artworkId={artwork.id} artworkTitle={artwork.title} />
              </div>
            )}
          </div>
        </div>

        {/* More work */}
        {more.length > 0 && (
          <section className="mt-28 border-t border-ink/10 pt-16 md:mt-40">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-3xl sm:text-4xl">More from the collection</h2>
              <Link href="/gallery" className="link-underline text-xs uppercase tracking-label text-ink/60 hover:text-ink">
                All work <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {more.map((item, i) => (
                <Reveal key={item.id} delay={i * 120}>
                  <Link href={`/gallery/${item.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="media-zoom"
                      />
                    </div>
                    <h3 className="mt-4 font-serif text-xl transition-colors duration-300 group-hover:text-brass">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11px] uppercase tracking-label text-ink/40">
                      {item.category}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="h-28 md:h-40" />
    </article>
  );
}

function InquiryForm({ artworkId, artworkTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, artwork_id: artworkId }),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '', website: '' });
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to send enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Failed to send inquiry:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="eyebrow-rule">Enquiry — {artworkTitle}</p>

      {success && (
        <p className="border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Enquiry sent. We&apos;ll get back to you shortly.
        </p>
      )}
      {error && (
        <p className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-aw">Website</label>
        <input
          type="text"
          id="website-aw"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="aw-name" className="field-label">Name</label>
        <input
          type="text"
          id="aw-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="field"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="aw-email" className="field-label">Email</label>
        <input
          type="email"
          id="aw-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="field"
          placeholder="you@email.com"
        />
      </div>
      <div>
        <label htmlFor="aw-message" className="field-label">Message</label>
        <textarea
          id="aw-message"
          name="message"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          required
          className="field resize-none"
          placeholder="I'd like to know more about this piece…"
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
