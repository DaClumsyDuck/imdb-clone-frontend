/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enable dark mode using class strategy
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
