import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        talklink: {
          "50": "var(--talklink-50)",
          "100": "var(--talklink-100)",
          "200": "var(--talklink-200)",
          "300": "var(--talklink-300)",
          "400": "var(--talklink-400)",
          "500": "var(--talklink-500)",
          "600": "var(--talklink-600)",
          "700": "var(--talklink-700)",
          "800": "var(--talklink-800)",
          "900": "var(--talklink-900)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
        inter: ["var(--font-inter)"],
        outfit: ["var(--font-outfit)"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "-0.2px" }],
        sm: ["14px", { lineHeight: "20px", letterSpacing: "-0.2px" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "-0.3px" }],
        lg: ["18px", { lineHeight: "28px", letterSpacing: "-0.3px" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.1px" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.2px" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.3px" }],
        "4xl": ["36px", { lineHeight: "40px", letterSpacing: "-0.4px" }],
        "5xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.5px" }],
        "6xl": ["60px", { lineHeight: "64px", letterSpacing: "-0.5px" }],
        "7xl": ["72px", { lineHeight: "76px", letterSpacing: "-0.6px" }],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
