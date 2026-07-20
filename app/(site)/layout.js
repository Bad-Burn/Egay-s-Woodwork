import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

// Public-facing pages only. Admin routes deliberately skip this chrome.
export default function SiteLayout({ children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]
                   focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-screen">{children}</main>
      <Footer />
      <ChatBot />
    </>
  );
}
