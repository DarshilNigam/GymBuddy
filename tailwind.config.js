/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#f8fafc',
          dark: '#07090e',
        },
        surface: {
          light: '#ffffff',
          'light-subtle': '#f1f5f9',
          'light-border': '#e2e8f0',
          50: '#161b26',
          100: '#121620',
          200: '#0e121a',
          300: '#0a0d14',
          card: 'rgba(18, 22, 34, 0.75)',
          glass: 'rgba(22, 27, 38, 0.65)',
        },
        brand: {
          primary: '#2563eb', // Clean athletic sports blue
          'primary-hover': '#1d4ed8',
          'primary-light': '#eff6ff',
          'primary-border': '#bfdbfe',
          lime: '#10B981',
          neon: '#00F5A0',
          cyan: '#00D9F5',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          amber: '#F59E0B',
          orange: '#F97316',
          rose: '#F43F5E',
        },
        border: {
          light: '#e2e8f0',
          'light-blue': 'rgba(59, 130, 246, 0.2)',
          dark: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(0, 245, 160, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'light-card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'light-hover': '0 12px 30px -4px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'light-blue': '0 0 25px -5px rgba(37, 99, 235, 0.2)',
        'glow-neon': '0 0 25px -5px rgba(0, 245, 160, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(0, 217, 245, 0.3)',
        'glow-pulse': '0 0 40px -10px rgba(0, 245, 160, 0.45)',
        'glass-edge': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
