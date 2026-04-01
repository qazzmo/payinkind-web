/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          900: '#085041',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}
