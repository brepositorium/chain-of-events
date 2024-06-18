/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#1A61DB",
          "primary-content": "#ffffff",
          secondary: "##f1f4fe",
          "secondary-content": "#ffffff",
          accent: "#AA3A4B",
          "accent-content": "#737373",
          neutral: "#737373",
          "neutral-content": "#385183",
          "base-100": "#4E35F6",
          "base-200": "#f1f1f1",
          "base-300": "#5295B5",
          "base-content": "#3b3b3b",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/background.png')",
        'circles': "url('/circles-bg.png')",
        'spirals': "url('/spirals-bg.png')",
        'red-pattern': "url('/red-pattern.png')",
        'green-pattern': "url('/green-pattern.png')",
        'blue-pattern': "url('/blue-pattern.png')",
      },
      fontFamily: {
        poppins: ["poppins", "sans-serif"],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(255 255 255)",
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'white': '0 5px 10px -5px rgb(150 150 150)',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'overlay': 'rgba(255, 255, 255, 0.8)',
      }),
    },
  },
};
