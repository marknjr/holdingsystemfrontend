/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          //"base-300": "#bae6fd",
          "--rounded-box": "0.4rem",
        },
      },
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],

  safelist: ['alert-success', 'alert-error', 'alert-info', 'bg-red-200', 'bg-green-200'],
}

