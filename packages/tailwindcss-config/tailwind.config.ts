import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} as Omit<Config, 'content'>;
