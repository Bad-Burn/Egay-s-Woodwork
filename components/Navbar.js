'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/gallery', label: 'Work' },
  { href: '/about', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Only the home page opens with a dark full-bleed hero, so only there does
  // the bar start out transparent with light type.
  const hasDarkHero = pathname === '/';
  const overHero = hasDarkHero && !scrolled && !isMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => setIsMenuOpen(false), [pathname]);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-editorial ${
        overHero
          ? 'bg-transparent border-b border-transparent'
          : 'bg-paper/85 backdrop-blur-xl border-b border-ink/8'
      } ${overHero ? 'text-paper' : 'text-ink'}`}
    >
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ease-editorial ${
          scrolled ? 'h-16' : 'h-20 md:h-24'
        }`}>
          {/* Wordmark */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10">
              <Image
                src="/images/Egay Logo.png"
                alt=""
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-base sm:text-lg tracking-tight">
                Egay&apos;s Woodwork
              </span>
              <span
                className={`mt-1 block text-[9px] uppercase tracking-label transition-colors ${
                  overHero ? 'text-paper/60' : 'text-ink/40'
                }`}
              >
                Paete · Laguna
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-xs uppercase tracking-label transition-colors duration-300 ${
                  isActive(l.href)
                    ? 'text-current'
                    : overHero
                      ? 'text-paper/65 hover:text-paper'
                      : 'text-ink/50 hover:text-ink'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-2 left-0 h-px w-full origin-left bg-brass transition-transform duration-500 ease-editorial ${
                    isActive(l.href) ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="-mr-2 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`h-px w-6 bg-current transition-transform duration-300 ${
                isMenuOpen ? 'translate-y-[3px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-px w-6 bg-current transition-transform duration-300 ${
                isMenuOpen ? '-translate-y-[3px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-x-0 top-0 -z-10 origin-top bg-paper px-5 pb-10 pt-24 text-ink transition-all duration-500 ease-editorial md:hidden ${
          isMenuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <nav className="flex flex-col">
          {[{ href: '/', label: 'Home' }, ...LINKS].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="border-b border-ink/8 py-5 font-serif text-3xl tracking-tight"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="mr-4 align-super text-[10px] tracking-label text-brass">
                0{i + 1}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
