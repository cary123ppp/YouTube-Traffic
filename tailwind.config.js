/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#e78b68',
        surface: '#ffffff',
        primary: '#000000',
        secondary: '#333333',
      },
      boxShadow: {
        'neo': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
        'neo-sm': '3px 3px 0px 0px rgba(0, 0, 0, 1)',
        'glow': '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)',
      },
      animation: {
        'ants': 'ants 20s linear infinite',
      },
      keyframes: {
        ants: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '400px 0' }, // Increase distance for smoother loop
        }
      }
    },
  },
  plugins: [],
}
