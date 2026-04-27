/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED", // violeta intenso (botones principales)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F3FF", // lavanda muy claro
          foreground: "#4C1D95", // morado oscuro (texto sobre secundario)
        },
        accent: {
          DEFAULT: "#6D28D9", // violeta oscuro (acentos, fondos activos sidebar)
          foreground: "#FFFFFF",
        },
        background: "#FAFAFE", // casi blanco con matiz lavanda
        foreground: "#1E1B4B", // texto principal: azul muy oscuro/morado
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E1B4B",
        },
        muted: {
          DEFAULT: "#EDE9FE", // violeta palidísimo
          foreground: "#6B7280", // gris medio
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#8B5CF6",
        status: {
          success: "#10B981",
          error: "#EF4444",
          info: "#6D28D9", // ahora violeta
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        sharp:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
