import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'sans': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'xs': ['10px', '1.3'],
        'sm': ['12px', '1.4'],
        'base': ['14px', '1.4'],
        'lg': ['15px', '1.4'],
        'xl': ['16px', '1.3'],
        '2xl': ['18px', '1.2'],
        '3xl': ['20px', '1.2'],
        '4xl': ['22px', '1.1'],
        '5xl': ['24px', '1.1'],
      },
      spacing: {
        '1': '0.125rem',
        '2': '0.25rem',
        '3': '0.375rem',
        '4': '0.5rem',
        '5': '0.625rem',
        '6': '0.75rem',
        '8': '1rem',
        '10': '1.25rem',
        '12': '1.5rem',
        '16': '2rem',
        '20': '2.5rem',
        '24': '3rem',
      },
      colors: {
        // IT Panel Theme Colors
        primary: {
          DEFAULT: '#3B82F6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Keep lavender as secondary
        lavender: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#3B82F6', // Map to IT Panel primary
          600: '#2563EB', // Map to IT Panel primary-dark
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // IT Panel semantic colors
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
        },
        text: {
          DEFAULT: '#1e293b',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          from: {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
