/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Hebrew-first font stack
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        display: ['Assistant', 'Heebo', 'sans-serif'],
      },
      colors: {
        // Championship palette: team red + championship gold over stadium night
        pitch: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        team: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#991B1B',
        },
        gold: {
          DEFAULT: '#FBBF24',
          light: '#FCD34D',
          dark: '#D97706',
        },
        night: {
          DEFAULT: '#0b1020',
          800: '#111834',
          700: '#1a2348',
          600: '#27325f',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(251, 191, 36, 0.45)',
        card: '0 10px 40px -12px rgba(0, 0, 0, 0.55)',
      },
      backgroundImage: {
        'stadium-mesh':
          'radial-gradient( at 80% 0%, rgba(220,38,38,0.35) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(251,191,36,0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(34,197,94,0.18) 0px, transparent 50%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251,191,36,0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(251,191,36,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}
