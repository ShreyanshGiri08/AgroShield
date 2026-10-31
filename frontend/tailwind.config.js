/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#F8F7F4',        // Warm bone neutral canvas
          surface: '#FFFFFF',   // Pure matte white panel
          subtle: '#F0ECE1',    // Restrained secondary tile
          border: '#E3DDD1',    // Hairline warm border
          dark: '#141A15',      // Matte deep charcoal green for header
        },
        ink: {
          primary: '#1A211B',   // Deep readable charcoal
          secondary: '#576258', // Muted secondary text
          muted: '#859286',     // Footnotes / tertiary labels
          invert: '#F8F7F4',
        },
        accent: {
          DEFAULT: '#1E472D',   // Deep botanical forest green
          hover: '#153320',
          subtle: '#EBF3EC',
          warm: '#C27847',      // Terracotta highlight (used very sparingly)
          warmSubtle: '#F7EDE6',
        },
        state: {
          safe: '#276738',
          safeBg: '#EDF6EF',
          warning: '#995A1E',
          warningBg: '#FBF2E9',
          danger: '#9E2A2B',
          dangerBg: '#F9ECEC',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 3px rgba(26, 33, 27, 0.04), 0 4px 12px rgba(26, 33, 27, 0.03)',
        'panel-hover': '0 2px 6px rgba(26, 33, 27, 0.06), 0 8px 24px rgba(26, 33, 27, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    },
  },
  plugins: [],
}
