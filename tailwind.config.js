/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f6f9',
          100: '#e6ebf2',
          200: '#ccd6e3',
          300: '#a3b5cc',
          400: '#728eaa',
          500: '#4a6c8a',
          600: '#38546f',
          700: '#2f455b',
          800: '#27394b',
          900: '#243140',
          950: '#17202b',
        },
        gold: {
          50: '#fbf9f0',
          100: '#f6f1dc',
          200: '#ece2b8',
          300: '#e0cd8b',
          400: '#d4b665',
          500: '#c9a045',
          600: '#a37e35',
          700: '#7f602c',
          800: '#664f29',
          900: '#544125',
          950: '#2e2312',
        },
        cream: '#faf8f5',
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        lift: '0 12px 40px -12px rgba(0, 0, 0, 0.12)',
        glow: '0 0 40px -12px rgba(201, 160, 69, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
