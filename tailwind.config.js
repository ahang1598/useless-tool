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
        // 玄学馆专属金：功德 / 愿望 / 香火的赛博本色
        aura: '#ffc857',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-rev': 'spin-rev 6s linear infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'drift': 'drift 18s ease-in-out infinite',
        'aura-pulse': 'aura-pulse 3s ease-in-out infinite',
        'float-y': 'float-y 6s ease-in-out infinite',
        // 彩蛋特效用
        'shake': 'shake 0.4s ease-in-out infinite',
        'bubble-rise': 'bubble-rise 4s linear infinite',
        'chroma-flicker': 'chroma-flicker 0.15s steps(2) infinite',
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
        'aura-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // 屏幕抖动（时空余震）
        'shake': {
          '0%, 100%': { transform: 'translate(0,0) rotate(0)' },
          '20%': { transform: 'translate(-3px, 2px) rotate(-0.3deg)' },
          '40%': { transform: 'translate(3px, -2px) rotate(0.3deg)' },
          '60%': { transform: 'translate(-2px, -3px) rotate(-0.2deg)' },
          '80%': { transform: 'translate(2px, 3px) rotate(0.2deg)' },
        },
        // 气泡上升
        'bubble-rise': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-105vh) scale(1.1)', opacity: '0' },
        },
        // 色彩噪点闪烁
        'chroma-flicker': {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.12' },
        },
      },
    },
  },
  plugins: [],
}
