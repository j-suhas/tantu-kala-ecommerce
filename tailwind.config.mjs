/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Warm, festive, artisanal palette. Tune freely — see README.
        saffron: '#E8873A',   // primary accent (marigold/saffron)
        maroon: '#7A1F2B',     // deep festive red (headings, CTAs)
        henna: '#B84A2E',      // secondary warm
        cream: '#FBF4E9',      // page background
        sand: '#F0E4CE',       // cards / surfaces
        ink: '#2A211C',        // body text
        leaf: '#5E7A4F',       // "available" / success
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Mukta"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1120px' },
    },
  },
  plugins: [],
};
