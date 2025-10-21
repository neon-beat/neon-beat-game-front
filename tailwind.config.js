/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand / gradient stops (names chosen semantically)
        brand: {
          900: '#0f000f', // vignette outer
          800: '#1e001a',
          700: '#36002f',
          650: '#3b003f', // radial center start
          600: '#3d003c', // linear gradient edge
          550: '#4a004b',
          500: '#52003f',
          400: '#660042',
          300: '#77082f',
        },
        accent: {
          pink: '#c207a0', // border glow
          orange: '#ff5a00', // inner corner depth
          gold: '#fbbf24', // (amber-400 like) for buzzing state highlight
        },
        surface: {
          base: '#09050a',
          elevated: '#120a13',
        }
      },
      boxShadow: {
        'panel': '0 0 0 12px #c207a0, 8px 8px 0 #ff5a00',
        'buzz': '0 0 15px 0 rgba(251,191,36,0.8)',
      },
      backgroundImage: {
        'grain-overlay': 'url(/images/grain.svg)',
        'brand-radial': 'radial-gradient(ellipse at center,#3b003f 0%,#4a004b 25%,#36002f 55%,#1e001a 80%,#0f000f 100%)',
        'brand-linear': 'linear-gradient(15deg,#3d003c 0%,#52003f 15%,#660042 40%,#77082f 50%,#660042 60%,#52003f 85%,#3d003c 100%)',
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      ringColor: {
        buzz: '#fbbf24',
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(251,191,36,0.55)' },
          '50%': { boxShadow: '0 0 18px 4px rgba(251,191,36,0.9)' },
        }
      }
    },
  },
  plugins: [],
}
