import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  darkMode: "class", // default theme is LIGHT (spec section 46) - dark mode is opt-in, never forced
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#1462c9",
          600: "#0f4fa3",
          700: "#0c3f82",
          900: "#0a2f61",
        },
      },
    },
  },
  plugins: [],
};

export default config;
