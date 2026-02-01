/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A2A43',
        secondary: '#3D6B82',
        accent: '#E1A73B',
      },
    },
  },
  plugins: [],
};
