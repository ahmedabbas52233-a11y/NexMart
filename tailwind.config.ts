import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "#E5F1FF",
          blue: "#0D6EFD",
          gradient: {
            start: "#127FFF",
            end: "#0067FF",
          },
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Figma Custom Colors
        figma: {
          primary: "#0D6EFD",
          success: "#00B517",
          warning: "#FF9017",
          danger: "#FA3434",
          dangerLight: "#FFE3E3",
          background: "#F7FAFC",
          dark: "#1C1C1C",
          gray: {
            100: "#F7F7F7",
            200: "#E0E0E0",
            300: "#DEE2E7",
            400: "#BDC4CD",
            500: "#8B96A5",
            600: "#505050",
            700: "#404040",
            800: "#606060",
          },
          orange: "#FF9017",
          green: "#00B517",
          red: "#FA3434",
          blue: "#0D6EFD",
          promo: {
            orange: "#F38332",
            teal: "#55BDC4",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        sm: "0px 1px 2px rgba(56, 56, 56, 0.08)",
        md: "0px 1px 2px rgba(56, 56, 56, 0.25)",
        lg: "0px 4px 10px rgba(56, 56, 56, 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;