import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'pulse-bg': 'pulseBg 10s ease-in-out infinite',
        'slide-in-fade': 'slideInFade 0.4s ease-out',
        'pulse-slow': 'pulse 5s ease-in-out infinite',
        'blob': "blob 10s infinite cubic-bezier(0.42, 0, 0.58, 1)",
        'shine': 'shine 5s linear infinite',
      },
      keyframes: {
        blob: {
          "0%, 100%": { // Start and end at the same state for seamless looping
            transform: "translate(0px, 0px) scale(1)",
          },
          "25%": {
            transform: "translate(40px, -60px) scale(1.1)", // More pronounced movement
          },
          "50%": {
            transform: "translate(-50px, 80px) scale(0.9)", // Opposite direction, slightly smaller
          },
          "75%": {
            transform: "translate(60px, -30px) scale(1.05)", // Another shift
          },
        },
        pulseBg: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideInFade: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        "Lato-Regular":["Lato-Regular", "sans-serif"]
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
} satisfies Config;
