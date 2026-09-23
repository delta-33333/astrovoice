import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        celestial: {
          dark: "#0a0e1a",
          darker: "#050810",
          purple: "#6b46c1",
          gold: "#d4af37",
          blue: "#4a5ea8",
        },
      },
      backgroundImage: {
        'stars': "url('/stars-bg.svg')",
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(107, 70, 193, 0.5), 0 0 20px rgba(107, 70, 193, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(107, 70, 193, 0.8), 0 0 40px rgba(107, 70, 193, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
