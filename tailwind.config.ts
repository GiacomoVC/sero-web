import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral:    '#FF6B5E',
        orange:   '#FF8A3D',
        plum:     '#5B2D82',
        cream:    '#FAF8F5',
        ink:      '#18181B',
        neutral:  '#8F8F98',
        success:  '#37C978',
        sand:     '#E8E3DC',
        lilac:    '#B78BB8',
        gold:     '#FFD166',
        // Pastel chip palette (inspired by reference mock)
        peach:    '#FFD9CF',
        lavender: '#E9DCF6',
        mint:     '#D4ECDD',
        butter:   '#FFE9B0',
        sky:      '#D7E8F7',
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        hand: ['var(--font-caveat)', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
