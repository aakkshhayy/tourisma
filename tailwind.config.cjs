/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B35',
        ink: {
          50: '#F7F6F4',
          100: '#EDEAE4',
          200: '#D9D5CC',
          400: '#7E776B',
          600: '#3F3B33',
          900: '#1A1815',
        },
        sand: '#FAF7F2',
        cream: '#F5F0E8',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(20, 14, 0, 0.06)',
        'card': '0 8px 32px -12px rgba(20, 14, 0, 0.10)',
        'glow': '0 12px 40px -12px rgba(255, 107, 53, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
