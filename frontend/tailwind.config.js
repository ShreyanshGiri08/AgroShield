/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: '#0F1108',
          900: '#0F1108',
          800: '#1b1e10',
          700: '#2b2f1c',
        },
        coffee: {
          DEFAULT: '#241909',
          950: '#191106',
          900: '#241909',
          800: '#382811',
          700: '#4d3718',
          600: '#644822',
        },
        peach: {
          DEFAULT: '#F3B391',
          light: '#f9d5c3',
          dark: '#e89467',
          deep: '#d97b49',
        },
        sand: {
          DEFAULT: '#F6D4BA',
          light: '#fae3d1',
          ultralight: '#fdf5ee',
          dark: '#ecc09e',
        },
        cornsilk: {
          DEFAULT: '#FEFADC',
          light: '#fffee8',
          surface: '#FDFBF4',
          dark: '#f6f0c7',
        },
        // Restrained semantic status colors
        agri: {
          safe: '#2E7D32',
          safeBg: '#E8F5E9',
          warning: '#E65100',
          warningBg: '#FFF3E0',
          danger: '#C62828',
          dangerBg: '#FFEBEE',
          info: '#0277BD',
          infoBg: '#E1F5FE',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(36, 25, 9, 0.04)',
        'card': '0 4px 20px -2px rgba(36, 25, 9, 0.05), 0 2px 6px -1px rgba(36, 25, 9, 0.03)',
        'card-hover': '0 12px 32px -4px rgba(36, 25, 9, 0.10), 0 4px 12px -2px rgba(36, 25, 9, 0.05)',
        'glow-peach': '0 0 24px -2px rgba(243, 179, 145, 0.45)',
        'glow-coffee': '0 8px 30px -4px rgba(36, 25, 9, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
