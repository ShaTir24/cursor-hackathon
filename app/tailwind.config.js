/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './src/**/*.{tsx,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0D7377',
          dark: '#0A5C5F',
          soft: '#D5F0F0',
        },
        app: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          'accent-soft': 'var(--color-accent-soft)',
          border: 'var(--color-border)',
          success: 'var(--color-success)',
          error: 'var(--color-error)',
          'on-accent': 'var(--color-on-accent)',
        },
      },
    },
  },
  plugins: [],
};
