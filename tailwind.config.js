/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0D0D1A',
          deeper: '#141428',
          card: '#1A1A35',
          accent: '#FF6B35',
          accentHover: '#FF8255',
          warm: '#FFB088',
          muted: '#8888AA',
          light: '#E8E0D8',
          cream: '#F5F0EB',
        }
      },
      fontFamily: {
        display: ['"Noto Sans JP"', 'sans-serif'],
        body: ['"Noto Sans JP"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
