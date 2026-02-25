/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
        body:    ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
      },
      colors: {
        // Static (non-theme) shades still needed by some tailwind classes
        'base-950': '#05070d',
        'accent-green': 'var(--accent-2)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        'pulse-accent': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        'fade-in':      'fade-in 0.25s ease-out',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
