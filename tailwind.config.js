/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#7A96FC',
          500: '#4F6BF6',
          600: '#2543EA',
          700: '#1D35CD',
          800: '#1E2B9E',
          900: '#0F172A', // Navy sober
          primary: '#1E3A8A', // Bleu Roi Institutionnel
          accent: '#2563EB', // Bleu Vif Accent
          sky: '#0284C7',
          surface: '#F8FAFC',
          dark: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        'elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
