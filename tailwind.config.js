/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        soul: {
          cream: '#f8f4ee',
          beige: '#efe5d9',
          lavender: '#e7e0f6',
          blue: '#dbe9f7',
          mist: '#f6f8fb',
          text: '#3a3346',
          muted: '#7a7287',
        },
      },
      boxShadow: {
        glow: '0 10px 40px rgba(149, 127, 187, 0.2)',
        soft: '0 8px 24px rgba(58, 51, 70, 0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.45 },
          '50%': { opacity: 0.8 },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

