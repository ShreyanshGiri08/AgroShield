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
        },
        coffee: {
          DEFAULT: '#241909',
          900: '#241909',
          800: '#382811',
          700: '#4d3718',
        },
        peach: {
          DEFAULT: '#F3B391',
          light: '#f7c8af',
          dark: '#e89467',
        },
        sand: {
          DEFAULT: '#F6D4BA',
          light: '#fae3d1',
          dark: '#ecc09e',
        },
        cornsilk: {
          DEFAULT: '#FEFADC',
          light: '#fffee8',
          dark: '#f6f0c7',
        },
        // Restrained semantic status colors
        agri: {
          safe: '#2E7D32',
          warning: '#ED6C02',
          danger: '#D32F2F',
          info: '#0288D1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
