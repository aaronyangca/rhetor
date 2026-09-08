import type { Config } from "tailwindcss";

/* tailwind.config.ts — merge the `theme.extend` blocks into your existing
   shadcn config. Everything else is the stock shadcn scaffold. */
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "Lora", "Georgia", "serif"],
        sans: ["var(--font-body)", "Lora", "Georgia", "serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          100: "hsl(var(--accent-100))",
          200: "hsl(var(--accent-200))",
          300: "hsl(var(--accent-300))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          700: "hsl(var(--accent-700))",
          800: "hsl(var(--accent-800))",
          900: "hsl(var(--accent-900))",
        },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "7px",
      },
      /* Classical's airy scale, density 1.15x */
      spacing: {
        1: "4.6px",
        2: "9.2px",
        3: "13.8px",
        4: "18.4px",
        6: "27.6px",
        8: "36.8px",
      },
      boxShadow: {
        sm: "0 1px 2px rgb(45 43 43 / 0.14)",
        DEFAULT: "0 3px 10px rgb(45 43 43 / 0.16)",
        lg: "0 12px 32px rgb(45 43 43 / 0.22)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
