/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          500: '#6366f1',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [],
}
