import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';

// Self-hosted by Next at build time: no third-party request, no swap flash.
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: "Egay's Woodwork — Handcrafted Carvings, Trophies & Name Plates",
  description:
    "Egay's Woodwork makes hand-carved wood pieces, wooden trophies, engraved name plates, and styrofoam sculpture in Paete, Laguna, Philippines.",
};

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=5';

/**
 * Root layout holds only the document shell and fonts. The public site chrome
 * (navbar, footer, chatbot) lives in the (site) group so the admin area can
 * render on its own, without the customer-facing navigation wrapped around it.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Scroll-reveal starts at opacity 0 and is switched on by JS. Without
            JS that would hide the page outright, so opt out entirely. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="bg-paper">{children}</body>
    </html>
  );
}
