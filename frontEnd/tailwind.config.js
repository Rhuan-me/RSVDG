/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Adicionado para garantir que pegue sua pasta app
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}