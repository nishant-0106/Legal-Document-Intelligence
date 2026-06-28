/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E6F1FB', 100: '#B5D4F4', 200: '#85B7EB',
          400: '#378ADD', 600: '#185FA5', 800: '#0C447C', 900: '#042C53',
        },
      },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','"Inter"','"Segoe UI"','sans-serif'],
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        blink:   { '0%,80%,100%': { opacity: '.3' }, '40%': { opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        slideUp: 'slideUp 0.2s ease',
        fadeIn:  'fadeIn 0.2s ease',
        blink:   'blink 1.2s infinite',
        scaleIn: 'scaleIn 0.15s ease',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
