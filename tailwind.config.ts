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
        primary: {
          DEFAULT: "#0D6EFD",
          50: "#E5F1FF",
          100: "#CCE3FF",
          200: "#99C8FF",
          300: "#66ACFF",
          400: "#3391FF",
          500: "#0D6EFD",
          600: "#0059D4",
          700: "#0044A0",
          800: "#002F6D",
          900: "#001A3A",
          light: "#E5F1FF",
        },
        success: "#00B517",
        warning: "#FF9017",
        danger: "#FA3434",
        background: "#F7FAFC",
        surface: "#FFFFFF",
        "surface-hover": "#F3F5F9",
        "text-primary": "#1C1C1C",
        "text-secondary": "#8B96A5",
        "text-muted": "#606060",
        border: "#DEE2E7",
        "border-light": "#EFF2F4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],
        "heading-1": ["2rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-2": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-3": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.5" }],
        body: ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.5" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        dropdown: "0 4px 20px rgba(0, 0, 0, 0.12)",
        focus: "0 0 0 3px rgba(0, 102, 255, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
