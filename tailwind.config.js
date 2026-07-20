/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Editorial gallery palette: paper, ink, and a single brass accent.
        paper: '#FBF9F6',
        canvas: '#F2EDE6',
        ink: '#16130F',
        brass: {
          DEFAULT: '#A67C2E',
          light: '#C9A24B',
          dark: '#7C5A1E',
        },
        cream: '#F7F3EC',
        gold: '#C9A24B',
        wood: {
          50: '#FAF7F3',
          100: '#EFE8DE',
          200: '#DCCFBE',
          300: '#BFAB92',
          400: '#9C8874',
          500: '#8A7358',
          600: '#6B5741',
          700: '#4E3F2E',
          800: '#31271C',
          900: '#1C1611',
        },
      },
      // Extra steps used by the hairline-rule styling (border-ink/8, /12, …).
      // These are needed for @apply, which only accepts scale values.
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 19, 15, 0.04), 0 8px 24px -12px rgba(22, 19, 15, 0.18)',
        'card-hover': '0 2px 4px rgba(22, 19, 15, 0.06), 0 28px 60px -24px rgba(22, 19, 15, 0.32)',
        artistic: '0 10px 40px rgba(22, 19, 15, 0.12)',
        glow: '0 0 0 1px rgba(166, 124, 46, 0.25), 0 12px 32px -12px rgba(166, 124, 46, 0.5)',
        frame: '0 0 0 1px rgba(22, 19, 15, 0.06)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Editorial display scale — tight leading, negative tracking.
        display: ['clamp(2.75rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2.25rem, 5.5vw, 4.25rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        label: '0.22em',
      },
      maxWidth: {
        editorial: '78rem',
        prose: '38rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        floatUp: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-up': 'floatUp 0.25s ease-out both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};
