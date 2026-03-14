import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0F",
        card: "#111118",
        border: "#1F1F28",
        primary: "#5B9CFF",
        accent: "#9EE6FF"
      },
      boxShadow: {
        glow: "0 0 20px rgba(91, 156, 255, 0.35)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 30px rgba(8, 12, 25, 0.45)"
      },
      backdropBlur: {
        glass: "18px"
      },
      backgroundImage: {
        "mesh-radial": "radial-gradient(1200px circle at 10% 0%, rgba(91,156,255,0.18), transparent 55%), radial-gradient(800px circle at 80% 20%, rgba(158,230,255,0.12), transparent 60%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
