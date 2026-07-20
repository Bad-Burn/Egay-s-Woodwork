export const metadata = {
  title: 'Admin — Egay\'s Woodwork',
  // Keep the admin area out of search results entirely.
  robots: { index: false, follow: false },
};

// Standalone shell: no public navbar, footer, or chat widget.
export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-canvas">{children}</div>;
}
