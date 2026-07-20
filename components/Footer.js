import Link from 'next/link';

const NAV = [
  { href: '/gallery', label: 'Work' },
  { href: '/about', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-canvas">
      <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8 md:py-24">
        {/* Oversized sign-off */}
        <p className="font-serif text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] tracking-tight text-ink/90">
          Egay&apos;s
          <br />
          <span className="italic text-brass">Woodwork</span>
        </p>

        <div className="mt-16 grid gap-12 border-t border-ink/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] uppercase tracking-label text-ink/40">The workshop</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Hand-carved wood, wooden trophies, engraved name plates, and
              styrofoam sculpture — made in Paete, Laguna, the woodcarving
              capital of the Philippines.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-label text-ink/40">Navigate</p>
            <ul className="mt-4 space-y-3">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-ink/70 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-label text-ink/40">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-ink/60">
              <li>
                <a
                  href="mailto:janjacobdriodoco@gmail.com"
                  className="break-all transition-colors hover:text-brass"
                >
                  janjacobdriodoco@gmail.com
                </a>
              </li>
              <li>Paete, Laguna, Philippines</li>
              <li>Facebook — Edgar C. Driodoco</li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-label text-ink/40">Commissions</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Open. Built to your size, design, and choice of wood.
            </p>
            <Link href="/contact" className="link-underline mt-4 text-ink">
              Start one <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-label text-ink/35">
            © {currentYear} Egay&apos;s Woodwork
          </p>
          <p className="text-[11px] uppercase tracking-label text-ink/35">
            Paete · Laguna · Philippines
          </p>
        </div>
      </div>
    </footer>
  );
}
