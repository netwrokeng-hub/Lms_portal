/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F5C518',
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF176',
          300: '#FFD600',
          400: '#F5C518',
          500: '#F0B400',
          600: '#E6A800',
          700: '#CC9400',
          800: '#B37F00',
          900: '#996A00',
        },
        dark: {
          DEFAULT: '#0A0A0F',
          50: '#1A1A2E',
          100: '#16213E',
          200: '#0F3460',
          300: '#0D1B2A',
          400: '#1B1B2F',
          500: '#0A0A0F',
          card: '#12121A',
          border: '#2A2A3E',
        },
        accent: {
          cyan: '#00D4FF',
          purple: '#7B2FBE',
          green: '#00E676',
          red: '#FF3366',
        }
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5C518' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #F5C518, 0 0 10px #F5C518' },
          '100%': { boxShadow: '0 0 20px #F5C518, 0 0 40px #F5C518, 0 0 80px #F5C518' },
        }
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(245, 197, 24, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
