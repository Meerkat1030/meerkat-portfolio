/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff', 100: '#dde6ff', 200: '#c4d1ff',
          300: '#a0b4ff', 400: '#7b8ff5', 500: '#5c6de8',
          600: '#4452d0', 700: '#3540b0', 800: '#2d368f',
          900: '#1e2460', 950: '#111540',
        },
        surface: {
          0:   '#ffffff', 50:  '#f8f9fc', 100: '#f0f2f8',
          200: '#e4e7f0', 700: '#3a3f60', 800: '#1a1d2e',
          900: '#0f1120', 950: '#080a14',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease both',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        card:        '0 2px 16px -2px rgba(0,0,0,0.07)',
        'card-hover':'0 16px 40px -8px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
