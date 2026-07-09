/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--bg)',
          bg2: 'var(--bg2)',
          bg3: 'var(--bg3)',
          bg4: 'var(--bg4)',
          border: 'var(--border)',
          border2: 'var(--border2)'
        },
        accent: {
          DEFAULT: '#6c63ff',
          2: '#4f46e5',
          3: '#7c3aed'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'pulse-slow': 'pulse 3s infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
      }
    }
  },
  plugins: []
};
