import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: { 50: 'rgb(var(--c-gray-50) / <alpha-value>)', 100: 'rgb(var(--c-gray-100) / <alpha-value>)', 200: 'rgb(var(--c-gray-200) / <alpha-value>)', 300: 'rgb(var(--c-gray-300) / <alpha-value>)', 400: 'rgb(var(--c-gray-400) / <alpha-value>)', 500: 'rgb(var(--c-gray-500) / <alpha-value>)', 600: 'rgb(var(--c-gray-600) / <alpha-value>)', 700: 'rgb(var(--c-gray-700) / <alpha-value>)', 800: 'rgb(var(--c-gray-800) / <alpha-value>)', 900: 'rgb(var(--c-gray-900) / <alpha-value>)', 950: 'rgb(var(--c-gray-950) / <alpha-value>)' },
        blue: { 50: 'rgb(var(--c-blue-50) / <alpha-value>)', 100: 'rgb(var(--c-blue-100) / <alpha-value>)', 200: 'rgb(var(--c-blue-200) / <alpha-value>)', 300: 'rgb(var(--c-blue-300) / <alpha-value>)', 400: 'rgb(var(--c-blue-400) / <alpha-value>)', 500: 'rgb(var(--c-blue-500) / <alpha-value>)', 600: 'rgb(var(--c-blue-600) / <alpha-value>)', 700: 'rgb(var(--c-blue-700) / <alpha-value>)', 800: 'rgb(var(--c-blue-800) / <alpha-value>)', 900: 'rgb(var(--c-blue-900) / <alpha-value>)', 950: 'rgb(var(--c-blue-950) / <alpha-value>)' },
        green: { 50: 'rgb(var(--c-green-50) / <alpha-value>)', 100: 'rgb(var(--c-green-100) / <alpha-value>)', 200: 'rgb(var(--c-green-200) / <alpha-value>)', 300: 'rgb(var(--c-green-300) / <alpha-value>)', 400: 'rgb(var(--c-green-400) / <alpha-value>)', 500: 'rgb(var(--c-green-500) / <alpha-value>)', 600: 'rgb(var(--c-green-600) / <alpha-value>)', 700: 'rgb(var(--c-green-700) / <alpha-value>)', 800: 'rgb(var(--c-green-800) / <alpha-value>)', 900: 'rgb(var(--c-green-900) / <alpha-value>)', 950: 'rgb(var(--c-green-950) / <alpha-value>)' },
        red: { 50: 'rgb(var(--c-red-50) / <alpha-value>)', 100: 'rgb(var(--c-red-100) / <alpha-value>)', 200: 'rgb(var(--c-red-200) / <alpha-value>)', 300: 'rgb(var(--c-red-300) / <alpha-value>)', 400: 'rgb(var(--c-red-400) / <alpha-value>)', 500: 'rgb(var(--c-red-500) / <alpha-value>)', 600: 'rgb(var(--c-red-600) / <alpha-value>)', 700: 'rgb(var(--c-red-700) / <alpha-value>)', 800: 'rgb(var(--c-red-800) / <alpha-value>)', 900: 'rgb(var(--c-red-900) / <alpha-value>)', 950: 'rgb(var(--c-red-950) / <alpha-value>)' },
        yellow: { 50: 'rgb(var(--c-yellow-50) / <alpha-value>)', 100: 'rgb(var(--c-yellow-100) / <alpha-value>)', 200: 'rgb(var(--c-yellow-200) / <alpha-value>)', 300: 'rgb(var(--c-yellow-300) / <alpha-value>)', 400: 'rgb(var(--c-yellow-400) / <alpha-value>)', 500: 'rgb(var(--c-yellow-500) / <alpha-value>)', 600: 'rgb(var(--c-yellow-600) / <alpha-value>)', 700: 'rgb(var(--c-yellow-700) / <alpha-value>)', 800: 'rgb(var(--c-yellow-800) / <alpha-value>)', 900: 'rgb(var(--c-yellow-900) / <alpha-value>)', 950: 'rgb(var(--c-yellow-950) / <alpha-value>)' },
        purple: { 50: 'rgb(var(--c-purple-50) / <alpha-value>)', 100: 'rgb(var(--c-purple-100) / <alpha-value>)', 200: 'rgb(var(--c-purple-200) / <alpha-value>)', 300: 'rgb(var(--c-purple-300) / <alpha-value>)', 400: 'rgb(var(--c-purple-400) / <alpha-value>)', 500: 'rgb(var(--c-purple-500) / <alpha-value>)', 600: 'rgb(var(--c-purple-600) / <alpha-value>)', 700: 'rgb(var(--c-purple-700) / <alpha-value>)', 800: 'rgb(var(--c-purple-800) / <alpha-value>)', 900: 'rgb(var(--c-purple-900) / <alpha-value>)', 950: 'rgb(var(--c-purple-950) / <alpha-value>)' },
        teal: { 50: 'rgb(var(--c-teal-50) / <alpha-value>)', 100: 'rgb(var(--c-teal-100) / <alpha-value>)', 200: 'rgb(var(--c-teal-200) / <alpha-value>)', 300: 'rgb(var(--c-teal-300) / <alpha-value>)', 400: 'rgb(var(--c-teal-400) / <alpha-value>)', 500: 'rgb(var(--c-teal-500) / <alpha-value>)', 600: 'rgb(var(--c-teal-600) / <alpha-value>)', 700: 'rgb(var(--c-teal-700) / <alpha-value>)', 800: 'rgb(var(--c-teal-800) / <alpha-value>)', 900: 'rgb(var(--c-teal-900) / <alpha-value>)', 950: 'rgb(var(--c-teal-950) / <alpha-value>)' },
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        page: 'rgb(var(--c-page) / <alpha-value>)',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        cyber: {
          dark: '#0a0e1a',
          card: '#111827',
          border: '#1f2937',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
export default config
