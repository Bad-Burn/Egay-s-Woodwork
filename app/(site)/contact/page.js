'use client';

import { useState } from 'react';

const DETAILS = [
  {
    label: 'Email',
    value: 'janjacobdriodoco@gmail.com',
    href: 'mailto:janjacobdriodoco@gmail.com',
  },
  { label: 'Workshop', value: 'Paete, Laguna, Philippines' },
  { label: 'Facebook', value: 'Edgar C. Driodoco · Jan Jacob D. Driodoco' },
  { label: 'Commissions', value: 'Share your design and size — we build to order.' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // honeypot: hidden from real users
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
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '', website: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to send inquiry:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 md:pt-36">
      {/* ── Masthead ───────────────────────────────────────────── */}
      <header className="mx-auto max-w-editorial px-5 sm:px-8">
        <p className="eyebrow-rule">Contact</p>
        <h1 className="mt-5 max-w-4xl font-serif text-display font-normal">
          Say hello.
        </h1>
        <p className="lede mt-10 max-w-prose">
          A question about a piece, or an idea for a commission — write to the
          workshop and we&apos;ll get back to you.
        </p>
      </header>

      <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8 md:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
          {/* ── Form ─────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {success && (
              <div className="border-l-2 border-emerald-600 bg-emerald-50 px-5 py-4">
                <p className="font-medium text-emerald-800">Message sent.</p>
                <p className="mt-1 text-sm text-emerald-700">
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            )}
            {error && (
              <div className="border-l-2 border-red-600 bg-red-50 px-5 py-4">
                <p className="font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="name" className="field-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="field"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="field"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="field-label">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="field resize-none"
                placeholder="Tell us what you're looking for…"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>

          {/* ── Details ──────────────────────────────────────── */}
          <aside className="lg:pt-2">
            <p className="eyebrow-rule">Elsewhere</p>
            <dl className="mt-8">
              {DETAILS.map((d) => (
                <div key={d.label} className="border-t border-ink/10 py-6 last:border-b">
                  <dt className="text-[10px] uppercase tracking-label text-ink/40">
                    {d.label}
                  </dt>
                  <dd className="mt-2.5 font-serif text-lg leading-snug">
                    {d.href ? (
                      <a href={d.href} className="link-underline break-all font-serif text-lg tracking-normal hover:text-brass">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-10 text-sm leading-relaxed text-ink/50">
              Replies usually within a day or two. For commissions, a photo or
              sketch and your rough dimensions help us quote faster.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
