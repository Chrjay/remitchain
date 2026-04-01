/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        code: ['"Space Mono"', 'monospace'],
      },
      colors: {
        bg: {
          base:  '#07090f',
          raised: '#0c1018',
          panel: '#101520',
          hover:  '#141b26',
        },
        border: {
          subtle: '#1a2640',
          DEFAULT: '#1f2e47',
          strong: '#253550',
        },
        cyan: {
          DEFAULT: '#00e5ff',
          dim:  'rgba(0,229,255,0.08)',
          glow: 'rgba(0,229,255,0.2)',
          muted: '#00b8d4',
        },
        gold: {
          DEFAULT: '#ffca28',
          dim: 'rgba(255,202,40,0.1)',
        },
        ink: {
          DEFAULT: '#dde8f8',
          muted:  '#7a95b8',
          faint:  '#3d5068',
        },
      },
      animation: {
        'spin-slow':    'spin 12s linear infinite',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
        'fade-up':      'fadeUp 0.3s ease forwards',
        'slide-in':     'slideIn 0.35s ease forwards',
        'toast-in':     'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'toast-out':    'toastOut 0.3s ease forwards',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.3' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(16px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        toastOut: {
          to: { opacity: '0', transform: 'translateX(16px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
