/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f3ff",
          100: "#c2e0ff",
          200: "#8fc3ff",
          300: "#57a3ff",
          400: "#2f8aff",
          500: "#006fff",
          600: "#0057db",
          700: "#0042aa",
          800: "#00327f",
          900: "#00235c"
        },
        secondary: {
          50: "#e6f9f1",
          100: "#c1f0dc",
          200: "#8ee0c1",
          300: "#54cfa4",
          400: "#26c190",
          500: "#00b37d",
          600: "#009268",
          700: "#007152",
          800: "#00503b",
          900: "#003626"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    }
  },
  plugins: []
};
