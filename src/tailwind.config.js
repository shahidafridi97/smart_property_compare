/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,jsx,tsx,mdx}',
    './src/components/**/*.{js,jsx,tsx,mdx}',
    './src/pages/**/*.{js,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      is: '375px',
      ss: '425px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      lg2: '1200px',
      '2xl': '1400px',
      '3xl': '1600px',
      '4xl': '1800px',
      '5xl': '2000px',
      '6xl': '2560px',
    },
 extend: {
  colors: {
    brand: {
      primary: "#334155",
      dark: "#020617",
      light: "#F1F5F9",
      border: "#CBD5F5",
      muted: "#64748B",
    }
  },

  fontFamily: {
    heading: ['BerlingskeSerif', 'serif'],
    body: ['FigtreeMedium', 'sans-serif'],
    primary: ['FigtreeMedium', 'sans-serif'],
    primarylight: ['FigtreeLight', 'sans-serif'],
    primarymedium: ['FigtreeMedium', 'sans-serif'],
    primarybold: ['FigtreeBold', 'sans-serif'],
    secondary: ['BerlingskeSerif', 'serif'],
  },

  keyframes: {
    gradient: {
      "0%,100%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
    },
    gridMove: {
      "0%": { backgroundPosition: "0 0" },
      "100%": { backgroundPosition: "80px 80px" },
    },
    floatSlow: {
      "0%,100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(30px)" },
    },
    floatSlow2: {
      "0%,100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-30px)" },
    },
  },

  animation: {
    gradient: "gradient 10s ease infinite",
    gridMove: "gridMove 20s linear infinite",
    floatSlow: "floatSlow 12s ease-in-out infinite",
    floatSlow2: "floatSlow2 14s ease-in-out infinite",
  },
}
  },
  plugins: [],
};
