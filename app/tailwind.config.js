/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './src/**/*.{tsx,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F766E',
          dark: '#115E59',
          soft: '#CCFBF1',
        },
      },
    },
  },
  plugins: [],
};
