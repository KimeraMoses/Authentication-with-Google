/** @type {import('tailwindcss').Config} */
module.exports = {
  impotant: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "600px",
      // => @media (min-width: 600px) { ... }
      md: "900px",
      // => @media (min-width: 900px) { ... }
      lg: "1200px",
      // => @media (min-width: 1200px) { ... }
      xl: "1536px",
      // => @media (min-width: 1536px) { ... }
      xxl: "1700px",
      // => @media (min-width: 1700px) { ... }
    },
    extend: {},
  },
  plugins: [],
};
