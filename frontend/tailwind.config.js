/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          foreground: '#FFFFFF',
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF6B00',
          600: '#EA580C',
          900: '#7C2D12'
        },
        secondary: {
          DEFAULT: '#00E676',
          foreground: '#003311',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669'
        },
        accent: {
          DEFAULT: '#6200EA',
          foreground: '#FFFFFF',
          50: '#F5F3FF',
          500: '#8B5CF6'
        },
        background: {
          DEFAULT: '#F8FAFC',
          paper: '#FFFFFF',
          subtle: '#F1F5F9'
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'card': '0 8px 30px rgb(0 0 0 / 0.04)',
        'float': '0 20px 50px rgb(0 0 0 / 0.1)',
        'glow-primary': '0 0 20px rgba(255, 107, 0, 0.3)',
        'glow-savings': '0 0 20px rgba(0, 230, 118, 0.3)'
      },
      borderRadius: {
        'card': '1.5rem',
        'xl': '0.75rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};