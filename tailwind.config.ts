import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral:   '#FF6B5E',
        orange:  '#FF8A3D',
        plum:    '#5B2D82',
        cream:   '#FAF8F5',
        ink:     '#18181B',
        neutral: '#8F8F98',
        success: '#37C978',
        sand:    '#E8E3DC',
        lilac:   '#B78BB8',
        gold:    '#FFD166',
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
