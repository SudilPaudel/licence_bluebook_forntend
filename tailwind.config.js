/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'nepal-blue': '#006EAF',
        'nepal-red':'#D42C2C',
      }
    },
  },
  plugins: [],
}