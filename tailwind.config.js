/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"PingFang SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },
      colors: {
        void: '#0a0a0f',
        acid: '#d4ff3a',
        plasma: '#ff2d75',
        frost: '#7afcff',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-rev': 'spin-rev 6s linear infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'drift': 'drift 18s ease-in-out infinite',
      },
      keyframes: {
        'spin-rev': {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(40px)' },
          '50%': { opacity: '1', filter: 'blur(60px)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0,0)' },
          '33%': { transform: 'translate(2%, -3%)' },
          '66%': { transform: 'translate(-2%, 2%)' },
        },
      },
    },
  },
  plugins: [],
}
